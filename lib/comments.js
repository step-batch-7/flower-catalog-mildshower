const Comment = require('./comment');

const INDENT_SPACE = 2;

class Comments{
  constructor(){
    this.records = [];
  }

  add(comment){
    this.records.unshift(comment);
  }

  toHTML(){
    return this.records.map(comment => comment.toHTML()).join('\n');
  }

  toJSON(){
    return JSON.stringify(this.records, null, INDENT_SPACE);
  }

  static from(commentList){
    const comments = new Comments();
    commentList.forEach(commentObj => {
      const {name, comment, time} = commentObj;
      comments.add(new Comment(name, comment, new Date(time)));
    });
    return comments;
  }
}

module.exports = Comments;
