function generateUser(totalTime, totalUserCount, floorNum) {
  let users = [];

  let lastTime = 0;
  let step = totalTime / totalUserCount * 2;

  while (users.length < totalUserCount) {
    lastTime = parseFloat((lastTime + Math.random() * step).toFixed(2));
    let startFloorLevel = Math.floor(Math.random()*floorNum);
    let destinationFloorLevel = startFloorLevel;
    while (destinationFloorLevel === startFloorLevel) {
      destinationFloorLevel = Math.floor(Math.random()*floorNum);
    }
    users.push({
      time: lastTime,
      startFloorLevel,
      destinationFloorLevel
    })
  }

  return users;
}

/**
 * 生成关卡文件
 * @param totalTime 人出现的总时间(因为是随机出现，所以时间是一个大概值)
 * @param totalUserCount 人的总数
 * @param floorNum 楼层数量
 * @param elevatorNum 电梯数量
 * @param elevatorCapacity 单梯容量
 */
function generateChallenge(totalTime, totalUserCount, floorNum, elevatorNum, elevatorCapacity) {
  let challengeData = {
    title: '随机关卡',
    floorNum,
    elevatorNum,
    elevatorCapacity,
    users: generateUser(totalTime, totalUserCount, floorNum)
  };
  return JSON.stringify(challengeData);
}

console.log(generateChallenge(40, 200, 20, 3, 6));
