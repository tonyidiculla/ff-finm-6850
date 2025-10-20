import { promises as fs } from 'fs'
import path from 'path'

// Simple file-based data store for development
const DATA_DIR = path.join(process.cwd(), 'data')

export class JsonDataStore {
  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR)
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true })
    }
  }

  private static getFilePath(collection: string): string {
    return path.join(DATA_DIR, `${collection}.json`)
  }

  static async read<T>(collection: string): Promise<T[]> {
    await this.ensureDataDir()
    const filePath = this.getFilePath(collection)
    
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data, (key, value) => {
        // Convert date strings back to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
        }
        return value
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []
      }
      throw error
    }
  }

  static async write<T>(collection: string, data: T[]): Promise<void> {
    await this.ensureDataDir()
    const filePath = this.getFilePath(collection)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  }

  static async findById<T extends { id: string }>(
    collection: string, 
    id: string
  ): Promise<T | null> {
    const data = await this.read<T>(collection)
    return data.find(item => item.id === id) || null
  }

  static async findMany<T>(
    collection: string,
    filter: (item: T) => boolean
  ): Promise<T[]> {
    const data = await this.read<T>(collection)
    return data.filter(filter)
  }

  static async create<T extends { id: string }>(
    collection: string,
    item: T
  ): Promise<T> {
    const data = await this.read<T>(collection)
    data.push(item)
    await this.write(collection, data)
    return item
  }

  static async update<T extends { id: string }>(
    collection: string,
    id: string,
    updates: Partial<Omit<T, 'id'>>
  ): Promise<T | null> {
    const data = await this.read<T>(collection)
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) return null
    
    data[index] = { ...data[index], ...updates } as T
    await this.write(collection, data)
    return data[index]
  }

  static async delete<T extends { id: string }>(
    collection: string,
    id: string
  ): Promise<boolean> {
    const data = await this.read<T>(collection)
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) return false
    
    data.splice(index, 1)
    await this.write(collection, data)
    return true
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}