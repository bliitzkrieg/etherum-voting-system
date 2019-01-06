var Election = artifacts.require("./Election.sol");

contract("Election", accounts => {
  let instance;

  it("Initializes with two candidates", async () => {
    instance = await Election.deployed();
    const count = await instance.candidatesCount();

    assert.equal(count, 2);
  });
  
  it("Initializes the candidates with the correct values", async () => {
    const candidateOne = await instance.candidates(1);
    const candidateTwo = await instance.candidates(2);

    assert.equal(candidateOne[0], 1, "contains the correct id");
    assert.equal(candidateOne[1], "Candidate 1", "contains the correct name");
    assert.equal(candidateOne[2], 0, "contains the correct vote count");

    assert.equal(candidateTwo[0], 2, "contains the correct id");
    assert.equal(candidateTwo[1], "Candidate 2", "contains the correct name");
    assert.equal(candidateTwo[2], 0, "contains the correct vote count");
  });

  it("allows a voter to cast a vote", async () => {
    const voter = accounts[0];
    const candidateId = 1;
    await instance.vote(candidateId, { from: voter });

    const voted = await instance.voters(voter);
    assert(voted, "the voter was marked as voted");

    const candidate = await instance.candidates(candidateId);
    const voteCount = candidate[2];
    assert.equal(voteCount, 1, "increments the candidate's vote count");
  });

  it("triggers the votedEvent", async () => {
    const voter = accounts[1];
    const candidateId = 1;
    const receipt = await instance.vote(candidateId, { from: voter });

    assert.equal(receipt.logs.length, 1, "an event was triggered");
    assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
    assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
  });

  it("throws an exception for invalid candidates", async () => {
    const voter = accounts[0];
    try {
      await instance.vote(99, { from: voter })
    } catch(error) {
      assert(error.message.includes('revert'), "error message must contain revert");
    }
    
    const candidateOne = await instance.candidates(1);
    assert.equal(candidateOne[2], 2, "candidate 1 did not recieve any votes");

    const candidateTwo = await instance.candidates(2);
    assert.equal(candidateTwo[2], 0, "candidate 2 did not recieve any votes");
  });

  it("throws an exception for double voting", async () => {
    const voter = accounts[2];
    const candidateId = 2;
    await instance.vote(candidateId, { from: voter })
    const candidate = await instance.candidates(candidateId);
    assert.equal(candidate[2], 1, "accepts first vote");
    
    try {
      await instance.vote(candidateId, { from: voter });
    } catch(error) {
      assert(error.message.includes('revert'), "error message must contain revert");
      const candidateOne = await instance.candidates(1);
      assert.equal(candidateOne[2], 2, "candidate 1 did not recieve any votes");
  
      const candidateTwo = await instance.candidates(2);
      assert.equal(candidateTwo[2], 1, "candidate 2 did not recieve any votes");
    }
  });

  
});