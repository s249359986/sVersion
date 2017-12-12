
/**
 * sVersion core class
 */

import pkg from '../../package.json';
import * as tool from '../lib/tool.js';
import $ from '../lib/query.js';

import './core.less';
import tpl from './core.html';
const SVERION_ID = '#__sversion';
class SVersion {
  constructor(opt) {
    if (!!$.one(SVERION_ID)) {
      console.debug('sversion is already exists.');
      return;
    }
    let that = this;
    this.version = pkg.version;
    this.$dom = null;
    this.isInited = false;
    this.switchPos = {
      x: 10, // right
      y: 60, // bottom
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    };
    this.tool = tool;
    this.$ = $;

    // merge options
    if (tool.isObject(opt)) {
      for (let key in opt) {
        this.option[key] = opt[key];
      }
    }
    // try to init
    let _onload = function() {
      if (that.isInited) {
        return;
      }
      that._render();
      that._bindEvent();
      that._autoRun();
    };
    if (document !== undefined) {
      if (document.readyState == 'complete') {
        _onload();
      } else {
        $.bind(window, 'load', _onload);
      }
    } else {
      // if document does not exist, wait for it
      let _timer;
      let _pollingDocument = function() {
          if (!!document && document.readyState == 'complete') {
            _timer && clearTimeout(_timer);
            _onload();
          } else {
            _timer = setTimeout(_pollingDocument, 1);
          }
        };
      _timer = setTimeout(_pollingDocument, 1);
    }
  }


  /**
   * render panel DOM
   * @private
   */
  _render() {
    if (! $.one(SVERION_ID)) {
      let e = document.createElement('div');
      e.innerHTML = tpl;
      document.documentElement.insertAdjacentElement('beforeend', e.children[0]);
    }
    this.$dom = $.one(SVERION_ID);

    // reposition switch button
    let $switch = $.one('.vc-switch', this.$dom);
    let switchX = tool.getStorage('switch_x') * 1,
        switchY = tool.getStorage('switch_y') * 1;
    if (switchX || switchY) {
      // check edge
      if (switchX + $switch.offsetWidth > document.documentElement.offsetWidth) {
        switchX = document.documentElement.offsetWidth - $switch.offsetWidth;
      }
      if (switchY + $switch.offsetHeight > document.documentElement.offsetHeight) {
        switchY = document.documentElement.offsetHeight - $switch.offsetHeight;
      }
      if (switchX < 0) { switchX = 0; }
      if (switchY < 0) { switchY = 0; }
      this.switchPos.x = switchX;
      this.switchPos.y = switchY;
      $.one('.vc-switch').style.right = switchX + 'px';
      $.one('.vc-switch').style.bottom = switchY + 'px';
    }

    // modify font-size
    let dpr = window.devicePixelRatio || 1;
    let viewportEl = document.querySelector('[name="viewport"]');
    if (viewportEl && viewportEl.content) {
      let initialScale = viewportEl.content.match(/initial\-scale\=\d+(\.\d+)?/);
      let scale = initialScale ? parseFloat(initialScale[0].split('=')[1]) : 1;
      if (scale < 1) {
        this.$dom.style.fontSize = 13 * dpr + 'px';
      }
    }

    // remove from less to present transition effect
    $.one('.vc-mask', this.$dom).style.display = 'none';
  };
  _bindEvent() {
    let that = this;

    // drag & drop switch button
    let $switch = $.one('.vc-switch', that.$dom);
    $.bind($switch, 'touchstart', function(e) {
      that.switchPos.startX = e.touches[0].pageX;
      that.switchPos.startY = e.touches[0].pageY;
    });
    $.bind($switch, 'touchend', function(e) {
      that.switchPos.x = that.switchPos.endX;
      that.switchPos.y = that.switchPos.endY;
      that.switchPos.startX = 0;
      that.switchPos.startY = 0;
      that.switchPos.endX = 0;
      that.switchPos.endY = 0;
      tool.setStorage('switch_x', that.switchPos.x);
      tool.setStorage('switch_y', that.switchPos.y);
    });
    $.bind($switch, 'touchmove', function(e) {
      if (e.touches.length > 0) {
        let offsetX = e.touches[0].pageX - that.switchPos.startX,
            offsetY = e.touches[0].pageY - that.switchPos.startY;
        let x = that.switchPos.x - offsetX,
            y = that.switchPos.y - offsetY;
        // check edge
        if (x + $switch.offsetWidth > document.documentElement.offsetWidth) {
          x = document.documentElement.offsetWidth - $switch.offsetWidth;
        }
        if (y + $switch.offsetHeight > document.documentElement.offsetHeight) {
          y = document.documentElement.offsetHeight - $switch.offsetHeight;
        }
        if (x < 0) { x = 0; }
        if (y < 0) { y = 0; }
        $switch.style.right = x + 'px';
        $switch.style.bottom = y + 'px';
        that.switchPos.endX = x;
        that.switchPos.endY = y;
        e.preventDefault();
      }
    });

    // show console panel
    $.bind($.one('.vc-switch', that.$dom), 'click', function() {
      that.show();
    });
    $.bind($.one('.vc-mask', that.$dom), 'click', function() {
      that.hide();
    });



    // disable background scrolling
    let $content = $.one('.vc-content', that.$dom);
    let preventMove = false;
    $.bind($content, 'touchstart', function (e) {
      let top = $content.scrollTop,
          totalScroll = $content.scrollHeight,
          currentScroll = top + $content.offsetHeight;
      if (top === 0) {
        // when content is on the top,
        // reset scrollTop to lower position to prevent iOS apply scroll action to background
        $content.scrollTop = 1;
        // however, when content's height is less than its container's height,
        // scrollTop always equals to 0 (it is always on the top),
        // so we need to prevent scroll event manually
        if ($content.scrollTop === 0) {
          if (!$.hasClass(e.target, 'vc-cmd-input')) { // skip input
            preventMove = true;
          }
        }
      } else if (currentScroll === totalScroll) {
        // when content is on the bottom,
        // do similar processing
        $content.scrollTop = top - 1;
        if ($content.scrollTop === top) {
          if (!$.hasClass(e.target, 'vc-cmd-input')) {
            preventMove = true;
          }
        }
      }
    });

    $.bind($content, 'touchmove', function (e) {
      if (preventMove) {
        e.preventDefault();
      }
    });

    $.bind($content, 'touchend', function (e) {
      preventMove = false;
    });
  };

  /**
   * auto run after initialization
   * @private
   */
  _autoRun() {
    this.isInited = true;
  }


  /**
   * show console panel
   * @public
   */
  show() {
    if (!this.isInited) {
      return;
    }
    let that = this;
    // before show console panel,
    // trigger a transitionstart event to make panel's property 'display' change from 'none' to 'block'
    let $panel = $.one('.vc-panel', this.$dom)
    let $mask = $.one('.vc-mask', this.$dom)
    $panel.innerHTML = window.sversionId
    $panel.style.display = 'block';
    $mask.style.display = 'block';
    // set 10ms delay to fix confict between display and transition
    // setTimeout(function() {
    //   let $mask = $.one('.vc-mask', that.$dom);
    //   $mask.style.display = 'block';
    // }, 4000);
  }

  /**
   * hide console panel
   * @public
   */
  hide() {
    if (!this.isInited) {
      return;
    }
    let $mask = $.one('.vc-mask', this.$dom),
        $panel = $.one('.vc-panel', this.$dom);
        $panel.style.display = 'none';
        $mask.style.display = 'none';
  }

} // END class

export default SVersion;
