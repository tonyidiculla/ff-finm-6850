// Utility functions for consistent date formatting across SSR and client

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Use ISO date parts to avoid locale/timezone issues
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Use ISO formatting for consistency
  return d.toISOString().split('T')[0]
}

export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  // Format as MM/DD/YYYY consistently
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  
  return `${month}/${day}/${year}`
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || 'Invalid Month'
}