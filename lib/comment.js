const getHtmlFormat = function(txt) {
  return txt.replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br>');
};

class Comment{
  constructor(name, comment, time){
    this.name = name;
    this.comment = comment;
    this.time = time;
  }

  toHTML(){
    return `
    <tr>
      <td>${new Date(this.time).toLocaleString()}</td>
      <td>${getHtmlFormat(this.name)}</td>
      <td>${getHtmlFormat(this.comment)}</td>
    </tr>`;
  }
}

module.exports = Comment;
