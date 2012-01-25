(function() {
  var NotFound, app, coffeekup, express, mongoStore, mongoose, routes;

  coffeekup = require("coffeekup");

  mongoStore = require("connect-mongodb");

  express = require("express");

  mongoose = require("mongoose");

  routes = require("./routes");

  NotFound = require("./lib/errors").NotFound;

  app = module.exports = express.createServer();

  app.configure("development", function() {
    this.set("db-uri", "mongodb://localhost/nodetunes-dev");
    this.set("view options", {
      format: true
    });
    return this.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure("production", function() {
    this.set("db-uri", "mongodb://localhost/nodetunes");
    this.use(express.session({
      store: mongoStore(this.set("db-uri")),
      secret: "rocknroll"
    }));
    return this.use(express.errorHandler());
  });

  app.configure(function() {
    this.set("views", "" + __dirname + "/../src/views");
    this.set("view engine", "coffee");
    this.register('.coffee', coffeekup.adapters.express);
    this.use(express.bodyParser());
    this.use(express.methodOverride());
    this.use(express.cookieParser());
    this.use(express.session({
      secret: "rocknroll"
    }));
    this.use(this.router);
    this.use(express.static("" + __dirname + "/public"));
    return mongoose.connect(this.set("db-uri"));
  });

  app.error(function(err, req, res, next) {
    if (err instanceof NotFound) {
      return res.render('404', {
        status: 404,
        error: err,
        title: '404 Not Found'
      });
    }
    return next(err);
  });

  app.dynamicHelpers({
    helpers: function(req, res) {
      return require("./lib/helpers");
    },
    get_messages: function(req, res) {
      return req.flash();
    },
    session: function(req, res) {
      return req.session;
    }
  });

  app.get("/", routes.index);

  app.get("/add", routes.add);

  app.post("/add", routes.add);

  app.get("/fortune/:fortune_slug", routes.show);

  app.get("*", function(req, res) {
    return res.render('404', {
      status: 404,
      title: "Not Found"
    });
  });

  app.listen(3000);

  console.log("Server listening on port " + (app.address().port) + " in " + app.settings.env + " mode");

}).call(this);