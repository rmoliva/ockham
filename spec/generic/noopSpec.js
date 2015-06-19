
describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
  it("create should return true", function() {
    var obj = Ockham.create({});
    expect(obj.test()).toBe(true);
  });
});


