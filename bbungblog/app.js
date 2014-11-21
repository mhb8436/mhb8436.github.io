/**
 * Module dependencies.
 */
 
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')
var routes = require('./routes');
var rest = require('./routes/rest');


 
var admin = express();
 
// all environments
admin.set('port', process.env.PORT || 8891);
admin.set('views', path.join(__dirname, 'views'));
admin.set('view engine', 'ejs');
admin.use(express.favicon());
admin.use(express.logger('dev'));
admin.use(express.json());
admin.use(express.urlencoded());
admin.use(express.methodOverride());
admin.use(express.cookieParser('S3CRE7'));
admin.use(express.session());
admin.use(require('express-domain-middleware'));
admin.use(admin.router);
admin.use(express.static(path.join(__dirname, 'public')));
admin.use( bodyParser.json() ); 
admin.use( bodyParser.urlencoded() );

// development only
if ('development' == admin.get('env')) {
	admin.use(express.errorHandler());
}

admin.all('/login', rest.login);

admin.all('/logout', rest.logout);


admin.get('/pages/:name', function(req, res){
	// res.render('pages/' + req.params.name, {title:'title'});
	res.render('pages/' + req.params.name, {title:'title', userid:req.session.user_id, is_super:req.session.is_super});
});

var default_route = function(req, res ) {
	console.log('default_route session id is ' + req.session.user_id);
	if(!req.session.user_id){
		res.redirect('/login');
	}
	res.render('index.jade', {title:'title', userid:req.session.user_id, is_super:req.session.is_super});
}



admin.get('/',  default_route);
admin.get('/ctrladm',  default_route);
admin.get('/ctrladm/bbmodel',  default_route);
admin.get('/ctrladm/agctl',  default_route);
admin.get('/ctrladm/weekfail',  default_route);

////////////////////////////////////////////////////////
//// rest api added 
////////////////////////////////////////////////////////
admin.all('/api/v1.0/user/menus/list', rest.list_menus);  // http://localhost:3001/admin/api/v1.0/group/list 

admin.all('/api/v1.0/bbmodel/list', rest.list_bbmodel);  // http://localhost:3001/admin/api/v1.0/group/list 
admin.all('/api/v1.0/bbmodel/summary01', rest.list_summary);  // http://localhost:3001/admin/api/v1.0/group/list 
admin.all('/api/v1.0/bbmodel/change', rest.update_bbmodel);  // http://localhost:3001/admin/api/v1.0/group/list 
admin.all('/api/v1.0/bbmodel/changeall', rest.update_all_bbmodel);  // http://localhost:3001/admin/api/v1.0/group/list 

admin.all('/api/v1.0/agctl/list', rest.list_agctl);  // http://localhost:3001/admin/api/v1.0/group/list 
admin.all('/api/v1.0/agctl/change', rest.update_agctl);  // http://localhost:3001/admin/api/v1.0/group/list 
admin.all('/api/v1.0/agctl/changeall', rest.update_all_agctl);  // http://localhost:3001/admin/api/v1.0/group/list 

admin.all('/api/v1.0/weekfail/list', rest.list_weekfail);  // http://localhost:3001/admin/api/v1.0/group/list 



http.createServer(admin).listen(admin.get('port'), function(){
  console.log('Express server listening on port ' + admin.get('port'));
});
