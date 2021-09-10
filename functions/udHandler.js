//requirement
const _ = require('lodash')

module.exports = function udHandler(vote , post , user){
    if(vote == 1) {
        return up(post , user._id)
    } else if (vote == -1 ){
        return down(post , user._id)
    }else {
        return null
    }
}

const isVoted = (array , id) => {
    let verify = _.find(array ,  {_id: id })
    if(verify){
        return true
    }
    else {
        return false
    }
}
const up  = (post , id) => {
    if(isVoted(post.down_votes , id)){
        post.down_votes = _.pull(post.down_votes._id , id)
    }
    if(isVoted(post.up_votes , id)){
        post.up_votes = _.pull(post.up_votes._id , id)
        return post
    }
    else {
        post.up_votes =_.concat(post.up_votes , {_id:id})    
        return post
    }
}

const down  = (post , id) => {
    if(isVoted(post.up_votes , id)){
        post.up_votes = _.pull(post.up_votes._id , {_id:id})
    }
    if(isVoted(post.down_votes , id)){
        post.down_votes = _.pull(post.down_votes._id , id)
        return post
    }
    else {
        post.down_votes =_.concat(post.down_votes , {_id:id})    
        return post
    }
}