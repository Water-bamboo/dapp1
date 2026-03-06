import { cn, formatAddress, formatTime } from '@/lib/utils';

describe('lib/utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional');
      expect(cn('base', false && 'conditional')).toBe('base');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });
  });

  describe('formatAddress', () => {
    it('should format address with default length', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(formatAddress(address)).toBe('0x123456...567890');
    });

    it('should format address with custom length', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(formatAddress(address, 4)).toBe('0x1234...7890');
    });

    it('should handle short addresses', () => {
      const address = '0x1234';
      expect(formatAddress(address, 2)).toBe('0x12...34');
    });
  });

  describe('formatTime', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for recent timestamps', () => {
      const now = Date.now();
      expect(formatTime(now)).toBe('Just now');
      expect(formatTime(now - 30000)).toBe('Just now'); // 30 seconds ago
    });

    it('should return minutes ago for timestamps within an hour', () => {
      const now = Date.now();
      expect(formatTime(now - 60000)).toBe('1 min ago');
      expect(formatTime(now - 300000)).toBe('5 min ago');
    });

    it('should return hours ago for timestamps within a day', () => {
      const now = Date.now();
      expect(formatTime(now - 3600000)).toBe('1 hours ago');
      expect(formatTime(now - 7200000)).toBe('2 hours ago');
    });

    it('should return locale date for older timestamps', () => {
      const oldDate = new Date('2024-01-01T12:00:00Z');
      expect(formatTime(oldDate.getTime())).toBe('1/1/2024');
    });
  });
});
