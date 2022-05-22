import VerticalLayout from './VerticalLayout.js';

export default () => `
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content' id='loading'>
        Loading...
      </div>
    </div>`;
