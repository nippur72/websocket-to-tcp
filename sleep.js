function sleep(milliseconds) {
   return new Promise((resolve, reject) => {
       setTimeout(() => {
           resolve(undefined);
       }, milliseconds);
   });
}

module.exports = sleep;
