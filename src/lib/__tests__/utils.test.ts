import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, generateId } from '../utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('should format a date string correctly', () => {
      const date = '2024-01-15'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/January 15, 2024/)
    })

    it('should format a Date object correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/January 15, 2024/)
    })

    it('should handle different date formats', () => {
      const date = '2024-12-25'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/December 25, 2024/)
    })

    it('should handle edge case: first day of year', () => {
      const date = '2024-01-01'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/January 1, 2024/)
    })

    it('should handle edge case: last day of year', () => {
      const date = '2024-12-31'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/December 31, 2024/)
    })
  })

  describe('formatTime', () => {
    it('should format seconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(30)).toBe('0:30')
      expect(formatTime(60)).toBe('1:00')
      expect(formatTime(90)).toBe('1:30')
      expect(formatTime(125)).toBe('2:05')
    })

    it('should handle minutes correctly', () => {
      expect(formatTime(300)).toBe('5:00')
      expect(formatTime(600)).toBe('10:00')
      expect(formatTime(3661)).toBe('61:01')
    })

    it('should pad seconds with leading zero', () => {
      expect(formatTime(61)).toBe('1:01')
      expect(formatTime(62)).toBe('1:02')
      expect(formatTime(69)).toBe('1:09')
    })

    it('should handle large values', () => {
      expect(formatTime(3600)).toBe('60:00')
      expect(formatTime(7200)).toBe('120:00')
    })

    it('should handle edge case: zero seconds', () => {
      expect(formatTime(0)).toBe('0:00')
    })
  })

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs of reasonable length', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
      expect(id.length).toBeLessThan(20)
    })

    it('should generate alphanumeric IDs', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/i)
    })
  })
})


