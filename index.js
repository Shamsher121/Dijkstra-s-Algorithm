//distance to each node is 1
let maze = 
[
  [0,0,0,0,1,0,0,0,0,1],
  [0,1,0,0,0,1,0,1,0,1],
  [0,0,0,1,0,0,0,1,0,1],
  [0,1,1,1,0,1,0,1,0,1],
  [0,0,0,0,0,1,0,1,0,0],
]

//Get HTML buttons and Div to populate
const container = document.getElementById("container");
const solveMazeButton = document.getElementById("solve-maze-button");
solveMazeButton.onclick = ()=>{solveMaze()}
makeMaze(maze);

function makeMaze(maze) {
    //put everything in here
      container.innerHTML = ''
  
      maze.forEach((e,r) => {
        let row = document.createElement("div");
        row.id = r
        container.appendChild(row).className = "row"
        e.forEach((x,c) => {
          let cell = document.createElement("div");
          cell.id = c
      
          if (r === 0 && c === 0){cell.innerText = "start"}
          if (r === maze.length-1 && c === e.length-1){cell.innerText = "end"}
      
          if(x===0){row.appendChild(cell).className = "open-cell";}
          if(x===1){row.appendChild(cell).className = "closed-cell";}
          if(x===2){row.appendChild(cell).className = "path-cell";}          
        })
      }) 
  }

//Here we set the start and end points
let startIndexes = {row: 0, col: 0};
let endIndexes = {row: maze.length-1, col: maze[maze.length-1].length-1};


function solveMaze(){
    dijkstraAlgorithm(maze, startIndexes, endIndexes);
  }

//start index cost is 0. Make this current node
//Get neighbour nodes from current nodes. These should not be dead end or visited
//Perform relaxation on the nodes that we are checking and set visited, previous node, and total cost values in this method
//add them to Min PQ if they are not already in there
//Remove the smallest cost from Min PQ and make this the current node. 
//Algorithm reaches end when
//Shortest path is calculated using the previous nodes

function dijkstraAlgorithm(maze, startIndexes, endIndexes){   
    let mazeData = getMaze(maze)
    let startNode = mazeData[startIndexes.row][startIndexes.col]
    let endNode = mazeData[endIndexes.row][endIndexes.col]
    startNode.startPoint = true
    endNode.endPoint = true
    startNode.shortestPath.totalCost = 0
    let currentNode = startNode
    let minPQ = []
    let checker = false
    let finalPath = []

    while(checker === false){
        let nodesToCheck = getNodesToCheck(currentNode, mazeData)
        relaxation(nodesToCheck, currentNode)        
        minPQ = [...minPQ, ...nodesToCheck].filter((item, index, array) => array.indexOf(item) === index)     
        minPQ.sort(function(a, b) {return a.shortestPath.totalCost - b.shortestPath.totalCost})  //Sort so that the first value is the minimum
        
        if(currentNode != startNode){minPQ.shift()}      
        currentNode = minPQ[0]
        if(minPQ.length === 0) {
            checker = true
            return console.log("NO PATH")
        }
        else if(currentNode.endPoint === true) {
            checker = true;
        }                      
    }      
    getPath(mazeData, endIndexes.row, endIndexes.col, finalPath) //populates the final path

    let finalMazePath = createMazePath(maze,finalPath);

    makeMaze(finalMazePath); //Create the maze with the final maze path

    return finalMazePath;
}

//Go through final path and add PATH to represent path
function createMazePath(maze, finalPath){
    const copyMaze = maze.map((row) => {
      return(row.map((col)=>{return col}))
    })

    for(let i=0; i<finalPath.length; i++){
        copyMaze[finalPath[i].row][finalPath[i].col] = 2
    } 
    return copyMaze
  }

//Gets the previous nodes of each node starting from the end. When it reaches the first node it will stop because that doesn't have a previous node.
  function getPath(mazeData, endRow, endCol, finalPath){
        if(mazeData[endRow][endCol].shortestPath.previousNode){            
            const previousRow = mazeData[endRow][endCol].shortestPath.previousNode.coordinates.row
            const previousCol = mazeData[endRow][endCol].shortestPath.previousNode.coordinates.col
            finalPath.unshift({row:previousRow, col:previousCol})
            getPath(mazeData, previousRow, previousCol, finalPath)
        }        
  }

//Here we are looping through the array to assign each node its details. Each node is has a default cause of infinity (1.7976931348623157E+10308) at first until we relax it.
  function getMaze(maze){
    let deadend = null
    const mazeNodeData = maze.map((row, rowIndex) => {
        return row.map((col, colIndex) => {            
             if (col === 0) {deadend = false} else {deadend = true}
            return (
                {deadEnd: deadend, shortestPath:{totalCost: 1.7976931348623157E+10308, previousNode: null}, startPoint: false, endPoint: false, visited: false, coordinates: {row: rowIndex, col:colIndex}}
            )
        })
     })
     return mazeNodeData;
  }  

function getNodesToCheck(node,maze){
    let arr = []
    if(maze[node.coordinates.row]){
        if(maze[node.coordinates.row][node.coordinates.col-1] && maze[node.coordinates.row][node.coordinates.col-1].visited === false && maze[node.coordinates.row][node.coordinates.col-1].deadEnd === false){arr.push(maze[node.coordinates.row][node.coordinates.col-1])}
    }
    if(maze[node.coordinates.row]){
        if(maze[node.coordinates.row][node.coordinates.col+1] && maze[node.coordinates.row][node.coordinates.col+1].visited === false && maze[node.coordinates.row][node.coordinates.col+1].deadEnd === false){arr.push(maze[node.coordinates.row][node.coordinates.col+1])}
    }
    if(maze[node.coordinates.row-1]){
        if(maze[node.coordinates.row-1][node.coordinates.col] && maze[node.coordinates.row-1][node.coordinates.col].visited === false && maze[node.coordinates.row-1][node.coordinates.col].deadEnd === false){arr.push(maze[node.coordinates.row-1][node.coordinates.col])}
    }
    if(maze[node.coordinates.row+1]){
        if(maze[node.coordinates.row+1][node.coordinates.col] && maze[node.coordinates.row+1][node.coordinates.col].visited === false && maze[node.coordinates.row+1][node.coordinates.col].deadEnd === false){arr.push(maze[node.coordinates.row+1][node.coordinates.col])}
    }

    let nodesForMinPQ = arr.sort(function(a, b) {
        return a.shortestPath.totalCost - b.shortestPath.totalCost;
      });

    return nodesForMinPQ
  }

//This is the process of updating the total cost of node if a shorter path is found. In the beginning total cost for all nodes infinity (1.7976931348623157E+10308)
//Previous node is also updated for that node
//The current node has also been marked as visited so that we don't visit it again from the next node
function relaxation(nodesToCheck, currentNode){
    for (let i = 0; i < nodesToCheck.length; i++){
        if(nodesToCheck[i].shortestPath.totalCost > currentNode.shortestPath.totalCost+1){ 
            nodesToCheck[i].shortestPath.totalCost = currentNode.shortestPath.totalCost+1
            nodesToCheck[i].shortestPath.previousNode = currentNode
        }
    }
    currentNode.visited = true 
  }
