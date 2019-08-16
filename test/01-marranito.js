const Marranito = artifacts.require('Marranito');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

contract('Marranito', accounts => {
  const [
    owner,
    unauthorized,
    userA,
    userB
  ] = accounts;
  describe('Deployment', () => {
    it('should deploy the contract without problems', () => {
      return Marranito.deployed().then(instance => {
        marranito = instance;
        expect(marranito).not.to.be.empty;
      });
    });
    it('should get a valid instance of the contract', () => {
      return expect(marranito).is.not.null;
    });
    it('should be registered to the expected owner', () => {
      return marranito.isOwner().then(response => {
        expect(response).to.be.true;
      });
    });
  });
  describe('Operations', () => {
    it('should get transfers from other accounts implicitly', () => {
      return web3.eth.sendTransaction({
        from: unauthorized,
        value: web3.utils.toWei('1'),
        to: marranito.address,
      })
        .then(response => {
          expect(response.transactionHash).to.match(/0x[a-f0-9]{64}/);
        });
    });
    it('should get transfers from other accounts explicitly', () => {
      return marranito.feedMe({from: userA, value: web3.utils.toWei('1')})
        .then(response => {
          expect(response.tx).to.match(/0x[a-f0-9]{64}/);
        });
    });
    it('should belong to owner', () => {
      return marranito.isOwner({from: owner}).then(response => {
        expect(response).to.be.true;
      });
    });
    it('should allow the owner to transfer the ownership to a new owner', () => {
      return marranito.transfer(userA, {from: owner})
        .then(response => {
          expect(response.tx).to.match(/0x[a-f0-9]{64}/);
        });
    });
    it('should belong to userA', () => {
      return marranito.isOwner({from: userA}).then(response => {
        expect(response).to.be.true;
      });
    });
    it('should not belong to owner', () => {
      return marranito.isOwner({from: owner}).then(response => {
        expect(response).to.be.false;
      });
    });
    it('should not allow not owner to seize the contract', () => {
      return expect(marranito.transfer(owner, {from: owner}))
        .to.be.eventually.rejected;
    });
    it('should send funds to other addresses', () => {
      return expect(marranito.sendFunds(unauthorized, web3.utils.toWei('1'), {from: userA}))
        .to.be.eventually.fulfilled;
    });
    it('should only owner to send funds to other addresses', () => {
      return expect(marranito.sendFunds(userB, web3.utils.toWei('1'), {from: unauthorized}))
        .to.be.eventually.rejected;
    });
    it('should allow to add an heir to the owner', () => {
      return marranito.addHeir(owner, 10, {from: userA}).then(response => {
        marranito.getHeirPercentage(owner).then(result => {
          expect(result.toString(10)).to.be.eq('10');
        });
      });
    });
    it('should not allow to add an heir when heir already exists', () => {
      return expect(marranito.addHeir(owner, 10, {from: userA}))
        .to.be.eventually.rejected;
    });
    it('should not allow to add an heir not to the owner', () => {
      return expect(marranito.addHeir(owner, 10, {from: unauthorized}))
        .to.be.eventually.rejected;
    });
    it('should not allow to add an heir when percentage is <= 0', () => {
      return expect(marranito.addHeir(userB, 0, {from: userA}))
        .to.be.eventually.rejected;
    });
    it('should not allow to add an heir when percentage is > 100', () => {
      return expect(marranito.addHeir(userB, 101, {from: userA}))
        .to.be.eventually.rejected;
    });
    it('should allow to remove an heir to the owner', () => {
      return marranito.removeHeir(owner, {from: userA}).then(response => {
        expect(marranito.hasHeir(owner)).to.be.eventually.false;
      });
    });
    it('should not allow to remove an heir not to the owner', () => {
      return expect(marranito.removeHeir(owner, {from: unauthorized}))
        .to.be.eventually.rejected;
    });
    it('should allow to update an heir to the owner', () => {
      return marranito.updateHeir(owner, 15, {from: userA}).then(response => {
        marranito.getHeirPercentage(owner).then(result => {
          expect(result.toString(10)).to.be.eq('15');
        });
      });
    });
    it('should not allow to update an heir not to the owner', () => {
      return expect(marranito.updateHeir(owner, 15, {from: unauthorized}))
        .to.be.eventually.rejected;
    });
    it('should not allow to add an heir when percentage is <= 0', () => {
      return expect(marranito.addHeir(owner, 0, {from: userA}))
        .to.be.eventually.rejected;
    });
    it('should not allow to add an heir when percentage is > 100', () => {
      return expect(marranito.addHeir(owner, 101, {from: userA}))
        .to.be.eventually.rejected;
    });
    it('should allow to prove an heir that they are one', () => {
      return expect(marranito.hasHeir(owner, {from: unauthorized}))
        .to.be.eventually.true;
    });
    it('should allow to prove an heir that they are one', () => {
      return expect(marranito.hasHeir(unauthorized, {from: unauthorized}))
        .to.be.eventually.false;
    });
  });
});
