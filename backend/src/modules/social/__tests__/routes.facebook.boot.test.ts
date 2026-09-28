/**
 * Boot test for the social Facebook routes module.
 *
 * Regression guard for issue #1566: `registerModules(app)` (called from
 * `backend/src/app.ts`) `require()`s `modules/social/routes.facebook.ts`, which
 * previously imported `'../lib/logger'` — a path that does not exist. That hard
 * `Cannot find module` error crashed the process before `app.ts` finished
 * loading. This test asserts the app (and therefore this module) loads without
 * throwing.
 */

describe('social/routes.facebook boot', () => {
  it('loads ../app without throwing for the social facebook module', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../../app');
    }).not.toThrow();
  });

  it('resolves the social facebook routes module without a module-not-found error', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../routes.facebook');
    }).not.toThrow();
  });
});
