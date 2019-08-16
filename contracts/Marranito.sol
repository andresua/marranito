pragma solidity >= 0.4.23 <0.6.0;

contract Marranito {
  address owner;
  uint8 totalPercentage;
  mapping(address => uint8) heirsToPercentage;

  event funds(address _sender, uint _value, string _msg);

  constructor() public {
    owner = msg.sender;
    totalPercentage = 0;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "You are not the owner");
    _;
  }

  modifier heirDoesntExists(address _heir) {
    require(heirsToPercentage[_heir] == uint8(0x0), "This heir already exists");
    _;
  }

  modifier percentagePositive(uint8 _percentage) {
    require(_percentage > 0, "This percentage is not positive");
    _;
  }

  modifier percentageLsEq100(uint8 _percentage) {
    require(_percentage <= 100, "This percentage is bigger than 100");
    _;
  }

  function isOwner() public view returns(bool) {
    return owner == msg.sender;
  }

  function feedMe() public payable {
    emit funds(msg.sender, msg.value, "Me mandaron platica");
  }

  function transfer(address _newOwner) public onlyOwner {
    owner = _newOwner;
  }

  function sendFunds(address payable _to, uint value) public onlyOwner {
     _to.transfer(value);
  }

  function hasHeir(address payable _heir) public view returns(bool) {
    return heirsToPercentage[_heir] != 0;
  }

  function getHeirPercentage(address payable _heir) public view returns(uint8) {
    return heirsToPercentage[_heir];
  }

  function addHeir(address payable _heir, uint8 _percentage) public heirDoesntExists(_heir)
      percentagePositive(_percentage) percentageLsEq100(_percentage) onlyOwner returns(bool) {
    updateHeir(_heir, _percentage);
    return heirsToPercentage[_heir] == 0;
  }

  function updateHeir(address payable _heir, uint8 _percentage) public percentagePositive(_percentage)
      percentageLsEq100(_percentage) onlyOwner returns(uint8) {
    return _updateHeir(_heir, _percentage);
  }

  function removeHeir(address payable _heir) public onlyOwner returns(bool) {
    _updateHeir(_heir, -heirsToPercentage[_heir]);
    heirsToPercentage[_heir] = uint8(0x0);
    return heirsToPercentage[_heir] == uint8(0x0);
  }

  function _updateHeir(address payable _heir, uint8 _percentage) private returns(uint8) {
    uint8 _currentPercentage = heirsToPercentage[_heir];
    totalPercentage += _percentage;
    heirsToPercentage[_heir] = _percentage;
    return _currentPercentage;
  }

  function() external payable {}
}
