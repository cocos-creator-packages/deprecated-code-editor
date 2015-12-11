'use strict';

Editor.require('app://editor/test-utils/renderer/init');

// =========================================



// =========================================

describe('<code-editor>', function() {
  Helper.runPanel( 'code-editor.panel' );
  this.timeout(0);

  it('should be a demo', function( done ) {
    try {
      let targetEL = Helper.targetEL;
    } catch ( err ) {
      console.error(err);
    }
  });
});
