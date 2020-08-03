const CHALLENGE_DATA_KEY = Symbol('CHALLENGE_DATA_KEY');

import World from './World.js';

window[CHALLENGE_DATA_KEY] = localStorage.getItem('elevatorChallenge');

$(document).ready(() => {
  const cm = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: false,
    theme: "solarized light",
    mode: "javascript",
    autoCloseBrackets: true,
    extraKeys: {
      // the following Tab key mapping is from http://codemirror.net/doc/manual.html#keymaps
      Tab: function(cm) {
        var spaces = new Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
      }
    }
  });
  cm.setValue(`{
      init: function(elevators, floors) {
          var elevator = elevators[0];
  
          elevator.on("idle", function() {
              elevator.goToFloor(0);
              elevator.goToFloor(1);
          });
      },
  }`);
  cm.on("change", function(codeMirror, change) {
    if(change.origin !== "paste") {
      return;
    }

    var lineFrom = change.from.line;
    var lineTo = change.from.line + change.text.length;

    function reindentLines(codeMirror, lineFrom, lineTo) {
      codeMirror.operation(function() {
        codeMirror.eachLine(lineFrom, lineTo, function(lineHandle) {
          codeMirror.indentLine(lineHandle.lineNo(), "smart");
        });
      });
    }

    reindentLines(codeMirror, lineFrom, lineTo);
  });

  setChallengeTitle();

  let oldWorld;
  $('#start-btn').click(function() {
    setChallengeTitle();
    try {
      oldWorld && oldWorld.destroy();
      const codeObj = getCodeObjFromCode(cm.getValue());
      let data = JSON.parse(window[CHALLENGE_DATA_KEY]);
      const world = new World(data.floorNum, data.elevatorNum, data.users, data.elevatorCapacity);
      oldWorld = world;
      if (data.transparent) {
        codeObj.init(world.elevatorAgents, world.floorAgents, data.users);
      } else {
        codeObj.init(world.elevatorAgents, world.floorAgents);
      }
      world.start();
    } catch(e) {
      console.error(e);
      alert('代码错误');
      return null;
    }
  })
});


function getCodeObjFromCode(code) {
  if (code.trim().substr(0,1) === "{" && code.trim().substr(-1,1) === "}") {
    code = "(" + code + ")";
  }
  let obj = eval(code);
  if(typeof obj.init !== "function") {
    throw "Code must contain an init function";
  }
  return obj;
}

$('#import-challenge-btn').click(function() {
  let challengeData = localStorage.getItem('elevatorChallenge');
  $('#challenge-textarea').val(challengeData);
  $('#import-modal').show();
});

$('#confirm-import').click(function() {
  let challengeData = $('#challenge-textarea').val();
  try {
    JSON.parse(challengeData);
  } catch (e) {
    console.error(e);
    return alert('关卡文件错误');
  }
  window[CHALLENGE_DATA_KEY] = challengeData;
  localStorage.setItem('elevatorChallenge', challengeData);
  $('#import-modal').hide();
  setChallengeTitle();
});

function setChallengeTitle() {
  if (!window[CHALLENGE_DATA_KEY]) {
    $('#import-challenge-btn').click();
    $('.challenge-title').text('未设置关卡');
    return false;
  }
  let data;
  try {
    data = JSON.parse(window[CHALLENGE_DATA_KEY]);
  } catch (e) {
    alert('关卡文件错误');
    return false;
  }
  $('.challenge-title').text(data.title);
  return true;
}
