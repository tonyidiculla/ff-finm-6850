import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('finm_journals')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch journals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch journals', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch journals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookId,
      date,
      description,
      reference,
      entries,
    } = body;

    // Validation
    if (!bookId || !date || !description || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, date, description, entries' },
        { status: 400 }
      );
    }

    if (entries.length < 2) {
      return NextResponse.json(
        { error: 'A journal entry must have at least 2 lines' },
        { status: 400 }
      );
    }

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      if (!entry.accountId) {
        return NextResponse.json(
          { error: 'All entries must have an accountId' },
          { status: 400 }
        );
      }

      const debit = parseFloat(entry.debitAmount || 0);
      const credit = parseFloat(entry.creditAmount || 0);

      if (debit < 0 || credit < 0) {
        return NextResponse.json(
          { error: 'Amounts cannot be negative' },
          { status: 400 }
        );
      }

      if (debit > 0 && credit > 0) {
        return NextResponse.json(
          { error: 'An entry cannot have both debit and credit amounts' },
          { status: 400 }
        );
      }

      if (debit === 0 && credit === 0) {
        return NextResponse.json(
          { error: 'An entry must have either a debit or credit amount' },
          { status: 400 }
        );
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    // Validate debit = credit (with small tolerance for floating point)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { 
          error: 'Debits must equal credits', 
          details: `Total Debits: ${totalDebit}, Total Credits: ${totalCredit}` 
        },
        { status: 400 }
      );
    }

    // Generate journal number (simple incrementing)
    const { data: lastJournal } = await supabaseAdmin
      .from('finm_journals')
      .select('journal_number')
      .eq('book_id', bookId)
      .order('journal_number', { ascending: false })
      .limit(1)
      .single();

    let journalNumber = 'JV-0001';
    if (lastJournal?.journal_number) {
      const lastNumber = parseInt(lastJournal.journal_number.split('-')[1] || '0');
      journalNumber = `JV-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Create journal
    const { data: journal, error: journalError } = await supabaseAdmin
      .from('finm_journals')
      .insert({
        book_id: bookId,
        journal_number: journalNumber,
        reference: reference || null,
        date: date,
        description: description,
        status: 'posted', // Auto-post for now
        total_amount: totalDebit,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (journalError) {
      console.error('Failed to create journal:', journalError);
      return NextResponse.json(
        { error: 'Failed to create journal', details: journalError.message },
        { status: 500 }
      );
    }

    // Create ledger entries
    const ledgerEntries = entries.map((entry: any, index: number) => ({
      journal_id: journal.id,
      account_id: entry.accountId,
      debit_amount: parseFloat(entry.debitAmount || 0),
      credit_amount: parseFloat(entry.creditAmount || 0),
      description: entry.description || null,
      line_number: index + 1,
    }));

    const { error: entriesError } = await supabaseAdmin
      .from('finm_ledger_entries')
      .insert(ledgerEntries);

    if (entriesError) {
      // Rollback journal if entries fail
      await supabaseAdmin
        .from('finm_journals')
        .delete()
        .eq('id', journal.id);

      console.error('Failed to create ledger entries:', entriesError);
      return NextResponse.json(
        { error: 'Failed to create ledger entries', details: entriesError.message },
        { status: 500 }
      );
    }

    // Fetch complete journal with entries
    const { data: completeJournal } = await supabaseAdmin
      .from('finm_journals')
      .select(`
        *,
        finm_ledger_entries!inner (
          id,
          account_id,
          debit_amount,
          credit_amount,
          description,
          line_number
        )
      `)
      .eq('id', journal.id)
      .single();

    return NextResponse.json(completeJournal, { status: 201 });
  } catch (error) {
    console.error('Failed to create journal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create journal', details: errorMessage },
      { status: 500 }
    );
  }
}