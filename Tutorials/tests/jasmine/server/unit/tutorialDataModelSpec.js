"use strict";
describe("Tutorial", function() {
    it("should be created with name and capacity", function() {
        spyOn(Tutorials, "insert").and.callFake(function(doc, callback) {
            // simulate async return of id = "1";
            callback(null, "1");
        });

        var tutorial = new Tutorial(null, "Tutorial 1", 20);

        expect(tutorial.name).toBe("Tutorial 1");
        expect(tutorial.capacity).toBe(20);

        tutorial.save();

        // id should be defined
        expect(tutorial.id).toEqual("1");
        expect(Tutorials.insert).toHaveBeenCalledWith({
            name: "Tutorial 1",
            capacity: 20,
            owner: null
        }, jasmine.any(Function));
    });

    it("should not be possible to delete tutorial with active registrations", function() {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(Tutorials, "remove");
        spyOn(TutorialRegistrations, "find").and.returnValue({
            count: function() {
                return 2
            }
        });

        try {
            Meteor.methodMap.removeTutorial("1");
        } catch (ex) {
            expect(ex).toBeDefined();
        }

        expect(Meteor.methodMap.removeTutorial).toThrow();
        expect(TutorialRegistrations.find).toHaveBeenCalledWith({
            tutorialId: "1"
        });
        expect(Tutorials.remove).not.toHaveBeenCalled();
    });

    it("Should not save when name is not defined", function() {
        var model = new Tutorial(null, "", 10);
        expect(function() {
            model.save();
        }).toThrow();
    });

    it("Should not save when capacity is not defined", function() {
        var model = new Tutorial(null, "Name", 0);
        expect(function() {
            model.save();
        }).toThrow();
    });

    it("should allow students to register for the tutorial", function() {
    var model = new Tutorial("1", "Name", 10, 5);
    var studentId = "2";
 
    spyOn(TutorialRegistrations, "insert");
 
    model.registerStudent(studentId);
 
    expect(model.currentCapacity).toBe(2);
    expect(TutorialRegistrations.insert).toHaveBeenCalled();
    expect(TutorialRegistrations.insert.calls.mostRecent().args[0]).toEqual({ tutorialId : '1', studentId : '2' });
});

});