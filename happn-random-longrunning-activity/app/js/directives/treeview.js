var module;

module = angular.module('angularBootstrapNavTree', []);
module.directive('abnTree', function($timeout) {
  return {
    restrict: 'E',
    templateUrl: '../templates/abn_tree_template.html',
    scope: {
      treeData: '=',
      metaData: '=',
      onSelect: '&',
      onExpandOrContract: '&',
      initialSelection: '='
    },
    link: function(scope, element, attrs) {

      var expand_level, for_each_branch, on_treeData_change, select_branch, selected_branch;

      //console.log('scope.metaData');
      //console.log(scope.metaData);

      if (attrs.iconExpand == null) {
        attrs.iconExpand = 'icon-plus';
      }
      if (attrs.iconCollapse == null) {
        attrs.iconCollapse = 'icon-minus';
      }
      if (attrs.iconLeaf == null) {
        attrs.iconLeaf = 'icon-chevron-right';
      }
      if (attrs.expandLevel == null) {
        attrs.expandLevel = '3';
      }
      expand_level = parseInt(attrs.expandLevel, 10);
      scope.header = attrs.header;

      //console.log('treedata in scope');
      //console.log(scope.treeData);

      /*
      if (!scope.treeData) {
        alert('no treeData defined for the tree!');
        debugger;
        return;
      }


      if (scope.treeData.length == null) {
        if (scope.treeData.label != null) {
          scope.treeData = [scope.treeData];
        } else {
          alert('treeData should be an array of root branches');
          debugger;
          return;
        }
      }
      */

      for_each_branch = function(f) {
        var do_f, root_branch, _i, _len, _ref, _results;
        do_f = function(branch, level) {
          var child, _i, _len, _ref, _results;
          f(branch, level);
          if (branch.children != null) {
            _ref = branch.children;

            //console.log('branch.children');
            //console.log(branch.children);

            _results = [];
            for (var property in _ref) {
              child = _ref[property];
              _results.push(do_f(child, level + 1));
            }
            return _results;
          }
        };
        _ref = scope.treeData;
        _results = [];
        for (var property in _ref) {
          root_branch = _ref[property];
          _results.push(do_f(root_branch, 1));
        }
        return _results;
      };

      /*
      if (scope.treeData) {
    	  //console.log('scope.treeData not null')
	      for_each_branch(function(b, level) {
	        b.level = level;
	        return b.expanded = b.level < expand_level;
	      });
      }
      */

      selected_branch = null;

      select_branch = function(branch) {
        if (branch !== selected_branch) {
          if (selected_branch != null) {
            selected_branch.selected = false;
          }
          branch.selected = true;
          selected_branch = branch;

          //$rootScope.selected_branch = branch;

          if (branch.onSelect != null) {
            return $timeout(function() {
              return branch.onSelect(branch);
            });
          } else {
            if (scope.onSelect != null) {
              return $timeout(function() {
                return scope.onSelect({
                  branch: branch
                });
              });
            }
          }
        }
      };

      scope.user_expands_or_contracts_branch = function(branch){

    	  /*
    	  if (branch.expanded)
    		  //console.log('branch expanded');
    	  else
    		  //console.log('branch contracted');
    	  */

    	  return scope.onExpandOrContract({
              branch: branch
          });

      }

      scope.user_clicks_branch = function(branch) {

        if (branch !== selected_branch) {
          return select_branch(branch);
        }
      };

     var property_is_meta = function(property) {
    	 if (property != 'path' &&
        	  property != 'expanded' &&
        	  property != 'selected' &&
            property != 'type' &&
            property != 'name' &&
            property != 'description' &&
            property != 'project' &&
            property != 'blueprint' &&
        	  property != '_meta')
    		 return false;
    	 else
    		 return true;

     }

     var branch_has_children = function(branch) {

    	// debugger;
    	 if (typeof branch === 'object')
         {
    		 for (var property in branch) {
	   	          if (!property_is_meta(property))
	   	        	 return true;
         	  }
         }

         return false;
     }

      scope.tree_rows = [];
      on_treeData_change = function() {

    	//console.log('scope.treeData');
    	//console.log(scope.treeData);

    	//console.log('scope.meta');
    	//console.log(scope.meta);

    	if (scope.treeData == null)
    		return;

    	//console.log('scope.treeData or meta has changed - moving on down');

        var add_branch_to_list, root_branch, _i, _len, _ref, _results;
        scope.tree_rows = [];

        /*
        for_each_branch(function(branch) {
          if (branch.children) {
            if (branch.children.length > 0) {
              return branch.children = branch.children.map(function(e) {
                if (typeof e === 'string') {
                  return {
                    label: e,
                    children: []
                  };
                } else {
                  return e;
                }
              });
            }
          } else {
            return branch.children = [];
          }
        });
        */

        add_branch_to_list = function(level, name, branch, parentbranch, visible) {
          var child, child_visible, tree_icon, _i, _len, _ref, _results;

          //console.log('add_branch_to_list');
          //console.log(branch);

          if (parentbranch == null)
        	  branchpath = '/' + name;
          else
        	  branchpath = parentbranch.path + '/' + name;

          if (scope.metaData && scope.metaData.expanded[branchpath] != null) {
            branch.expanded = true;
          }

          var branch_selected = false;

          if (scope.metaData && scope.metaData.selected == branchpath)
          {
        	  branch_selected = true;
        	  //console.log('BRANCH ' + branchpath + ' selected');
          }

          if (typeof branch === 'object')
          {
        	  branch.selected = branch_selected;

        	  if (branch_has_children(branch))
        	  {
        		  if (branch.expanded)
                      tree_icon = attrs.iconCollapse;
        	  	  else
                      tree_icon = attrs.iconExpand;
        	  }
        	  else
        		  tree_icon = attrs.iconLeaf;

          }
          else
          {
        	  //damn primitives, always causing kak
        	  tree_icon = attrs.iconLeaf;
        	  name = name + ':' + branch;
        	  branch = {selected:branch_selected};
          }

          branch.path = branchpath;

          //console.log('path');
          //console.log(branch.path);

          var tree_row = {level: level,
                  		  branch: branch,
                  		  label: name,
                  		  tree_icon: tree_icon,
                  		  visible: visible};

          scope.tree_rows.push(tree_row);
          _results = [];

      	  for (var property in branch) {
	          if (!property_is_meta(property))
	          {
	        	  child = branch[property];
	              child_visible = visible && branch.expanded;
	              //console.log('adding child');
	              //console.log(child);
	              //console.log(_results);
	              _results.push(add_branch_to_list(level + 1, property, child, branch, child_visible));
	          }
      	  }
      	  return _results;
         };


        //console.log(scope.treeData);
        _ref = angular.copy(scope.treeData);
        _results = [];
        for (var property in _ref) {
          root_branch = _ref[property];
          _results.push(add_branch_to_list(1, property, root_branch, null, true));
        }
        return _results;
      };

      /*
      if (attrs.initialSelection != null) {
        for_each_branch(function(b) {
          if (b.label === attrs.initialSelection) {
            return select_branch(b);
          }
        });
      }
      */

      //console.log('doing watch');
      scope.$watch('metaData', on_treeData_change, true);

      return scope.$watch('treeData', on_treeData_change, true);
    }
  };
});