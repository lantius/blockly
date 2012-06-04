// http://www.cs.washington.edu/education/courses/cse326/00wi/handouts/lecture18/sld015.htm
function Uptree() {
  return {
    h: {},
    find: function(id) {
      while(undefined !== this.h[id]) {
        id = this.h[id];
      }
      return id;
    },
    union: function(x, y) {
      this.h[y] = x;
    }
  };
};

function Cell(xpos, ypos) {
  return {
    x: xpos,
    y: ypos,
    top: true,
    bottom: true,
    left: true,
    right: true,
    id: function() {
      return ''+this.x+'_'+this.y;
    },
    wall_status: function() {
      var status = '';
      if( this.top    ) { status += 'top ';    }
      if( this.right  ) { status += 'right ';  }
      if( this.bottom ) { status += 'bottom '; }
      if( this.left )   { status += 'left ';   }
      return status;
    },
    is_connected_to: function(neighbor) {
      var this_obj = this;
      if( neighbor.x > this.x) {
        return !this.right;
      } else if( neighbor.x < this.x) {
        return !this.left;
      } else if( neighbor.y > this.y) {
        return !this.bottom;
      } else if( neighbor.y < this.y) {
        return !this.top;
      }
    },
    connect: function(neighbor) {
      var this_obj = this;
      if( neighbor.x > this.x) {
        this.right = false;
        neighbor.left = false;
      } else if( neighbor.x < this.x) {
        this.left = false;
        neighbor.right = false;
      } else if( neighbor.y > this.y) {
        this.bottom = false;
        neighbor.top = false;
      } else if( neighbor.y < this.y) {
        this.top = false;
        neighbor.bottom = false;
      }
    }
    
  };
};
 var MazeGen = {
      width: 8,
      height: 8,
      grid_yx: [],
      uptree: new Uptree(),
      finish: null,
      start: null,
      init: function() {
        this.prepare_grid_yx();
        this.explore();
        this.add_outlets();
        return this.convert();
      },
      prepare_grid_yx: function() {
        var row = 0;
        var rowdata, column, c;
        for( row = 0; row < this.height; row++ ) {
          rowdata = []
          column = 0;
          for( column = 0; column < this.width; column++ ) {
            c = new Cell(column, row)
            rowdata.push(c);
          }
          this.grid_yx.push(rowdata);
        }
      },
      explore: function() {
        // Really the only major change. Use randomized Kruskal's rather than DFS.
        // Generate( Maze m )
        //    While (# Walls Down < Total # Cells - 1)
        //       Choose random cell current
        //       Choose random neighbor of current that has a wall up between it and current
        //       If such a neighbor exists
        //          Find the labels of current and neighbor
        //          If they are different, union them, knock down the wall, and add to # Walls Down
        var walls_down = 0;
        var current, dirs, dir;
        while(walls_down < this.width * this.height - 1) {
          current = this.grid_yx[Math.floor(Math.random() * this.height)][Math.floor(Math.random() * this.width)]
          dirs = this.shuffle([[0,-1],[0,1],[-1,0],[1,0]]);
          for( dir = 0; dir < 4; dir++ ) {
            var neighbor = this.neighbor_cell(current, dirs[dir]);
            if(neighbor && !neighbor.is_connected_to(current)) {
              c_set = this.uptree.find(current.id());
              n_set = this.uptree.find(neighbor.id());
              if(c_set != n_set) {
                this.uptree.union(c_set, n_set);
                current.connect(neighbor);
                walls_down += 1;
              }
              break;
            }
          }
        }
      },
      add_outlets: function() {
        this.finish = Math.floor(Math.random() * this.height);
        this.start = Math.floor(Math.random() * this.height);
      },
      shuffle: function(ar) {
        var el;
        var iterations = 4 + Math.floor(Math.random()*5);
        var counter = 0;
        for(counter = 0; counter < iterations; counter++ ) {
          var op = Math.floor(Math.random() * 3);
          if( op == 0 ) {
            ar = ar.reverse();
          } else if( op == 1 ) {
            el = ar.shift();
            ar.push(el);
          } else if( op == 2 ) {
            el = ar.pop();
            ar.unshift(el);
          }
        }
        return ar;
      },
      neighbor_cell: function(cell, delta) {
        var new_x = cell.x + delta[0];
        var new_y = cell.y + delta[1];
        if(new_x < 0 || new_x >= this.width || new_y < 0 || new_y >= this.height) {
          return null;
        } else {
          var new_cell = this.grid_yx[new_y][new_x];
          return new_cell;
        }
      },
      convert: function() {
        /**
         * The maze's map is a 2D array of numbers.
         * 0: Empty space.
         * 1: Wall.
         * 2: Starting square.
         * 3. Finish square.
         */        
        var rows = [];
        
        var cols = [];
        for(var i = 0; i < this.grid_yx[0].length + 1; ++i) {
          cols[i] = 1;
        }
        rows[0] = cols;

        for(var i = 0; i < this.grid_yx.length; ++i) {
          var cols_a = [];
          var cols_b = [];
          cols_a[0] = 1;
          cols_b[0] = 1;
          for(var j = 0; j < this.grid_yx[i].length; ++j) {
            cols_a[2*j+1] = 0;
            cols_a[2*j+2] = this.grid_yx[i][j].right ? 1 : 0;
            cols_b[2*j+1] = this.grid_yx[i][j].bottom ? 1 : 0;
            cols_b[2*j+2] = 1;
            
            if(0 == j && i == this.start) {
              cols_a[2*j+1] = 2;
            }
            if(this.grid_yx[i].length - 1 == j && i == this.finish) {
              cols_a[2*j+1] = 3;
            }
          }
          rows[2*i+1] = cols_a;
          rows[2*i+2] = cols_b;
        }

        rows[0] = [];
        for(var i = 0; i < rows[1].length; ++i) {
          rows[0][i] = 1;
        }
        return rows;
      },
    };