// @TODO: YOUR CODE HERE!

d3.csv("../assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;

    // Data Exploration
    console.log(censusData)
     
    



}).catch(function(error) {
    console.log(error);
});
    