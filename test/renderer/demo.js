'use strict';

Editor.require('app://editor/test-utils/renderer/init');

// =========================================

// =========================================

describe('<code-editor>', function() {
  this.timeout(0);

  beforeEach(function () {
    Editor.Window.load('packages://code-editor/panel/index.html', {
      url: '',
      path: '',
    });
    Editor.Window.resize( 800, 600 );
    Editor.Window.center();
  });

  it('should be a demo', function( done ) {
    try {
    } catch ( err ) {
      console.error(err);
    }
  });
});
