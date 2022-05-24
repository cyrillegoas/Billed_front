import $ from 'jquery';

global.$ = $;
global.jQuery = $;

$.fn.modal = (x) => {
  $.fn.modal[x]();
};
$.fn.modal.show = () => {};

require('jest-fetch-mock').enableMocks();
