'use strict';

Editor.require('app://editor/test-utils/renderer/init');

// =========================================

// =========================================

describe('<code-editor>', function() {
  this.timeout(0);

  beforeEach(function () {
    Editor.Window.load('packages://code-editor/panel/index.html', {
      url: '',
      path: '/Users/minggo/SourceCode/test/fireball-test/assets/NewScript.js',
    });
    Editor.Window.resize( 800, 600 );
    Editor.Window.center();

    Editor.projectInfo = { path: '/Users/minggo/SourceCode/test/fireball-test' };
  });

  it('should be a demo', function( done ) {
    try {
    } catch ( err ) {
      console.error(err);
    }
  });
});
