import { describe, it, expect } from 'vitest';
import { PACKAGE_NAME, validatePackage } from './index';

describe('@repo/meditation-core', () => {
  it('exports package metadata', () => {
    expect(PACKAGE_NAME).toBe('@repo/meditation-core');
  });

  it('validatePackage returns true', () => {
    expect(validatePackage()).toBe(true);
  });
});
