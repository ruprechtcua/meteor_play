Tutorials = new Mongo.Collection("tutorials", {
    // transform: function(doc) {
    //     return new Tutorial(doc._id, doc.name, doc.capacity, doc.currentCapacity, doc.owner);
    // }
});

Tutorials.allow({
    insert: function(userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return (userId && doc.owner === Meteor.userId() && Roles.userIsInRole(userId, "admin"));
    },
    remove: function(userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    }
});

// A Tutorial class that takes a document in its constructor
Tutorial = function(id, name, capacity, owner) {
    this._id = id;
    this._name = name;
    this._capacity = capacity;
    this._owner = owner;
    this._currentCapacity = 0;
};

Tutorial.prototype = {
    get id() {
        // readonly
        return this._id;
    },
    get owner() {
        // readonly
        return this._owner;
    },
    get name() {
        return this._name;
    },
    set name(value) {
        this._name = value;
    },
    get capacity() {
        return this._capacity;
    },
    set capacity(value) {
        this._capacity = value;
    },
    get currentCapacity() {
        return this._currentCapacity;
    },
    set currentCapacity(value) {
        this._currentCapacity = value;
    },
    save: function(callback) {
        if (!this.name) {
            throw new Meteor.Error("Name is not defined!");
        }

        if (!this.capacity) {
            throw new Meteor.Error("Capacity has to be defined or bigger than zero!");
        }
        // remember the context since in callback it is changed
        var that = this;
        var doc = {
            name: this.name,
            capacity: this.capacity,
            owner: Meteor.userId()
        };

        Tutorials.insert(doc, function(error, result) {
            that._id = result;
            if (callback) {
                callback.call(that, error, result);
            }
        });

    },
    registerStudent: function(studentId) {
            if (this.currentCapacity >= this.capacity) {
                throw "Capacity of the tutorial has been reached!";
            }
            var that = this;
            TutorialRegistrations.insert({
                tutorialId: this._id,
                studentId: studentId
            }, function(err, id) {
                if (!err) {
                    that._currentCapacity += 1;
                }
            });
        }
};

if (Meteor.isServer) {
    Meteor.methods({
        removeTutorial: function(id) {
            if (!Meteor.user() || !Roles.userIsInRole(Meteor.user(), "admin")) {
                throw new Meteor.Error(403, "Access Denied");
            }
            if (TutorialRegistrations.find({
                tutorialId: id
            }).count() > 0) {
                throw new Meteor.Error(406, "Tutorial has registrations");
            }
            Tutorials.remove(id);
        }

    });
}