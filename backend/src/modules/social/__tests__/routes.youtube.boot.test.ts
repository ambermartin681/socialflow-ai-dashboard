/**
 * Boot test for the social youtube routes module.
 *
 * Regression guard for issue #1567: `registerModules(app)` requires
 * `modules/social/routes.youtube.ts`, which previously imported
 * `'../lib/logger'` (a path that does not exist) and crashed the app on boot
 * with a hard `Cannot find module` error.
 *
 * This test asserts that the app module loads without throwing and that the
 * youtube routes module can be required successfully.
 */

describe('social youtube routes boot', () => {
  it('loads ../app without throwing', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../app');
    }).not.toThrow();
  });

  it('requires the youtube routes module without throwing', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../routes.youtube');
    }).not.toThrow();
  });
});
