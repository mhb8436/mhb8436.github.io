#-*- coding: utf-8 -*-
import time
import webapp2
import csv
import sys, time
import re
import urllib
import urllib2
import json
import gzip
from StringIO import StringIO
import base64
import codecs

from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.api import taskqueue

import jinja2
import os
from random import randint
from google.appengine.api import memcache

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

class Category(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    date = ndb.DateTimeProperty(auto_now_add=True)
    ordr = ndb.IntegerProperty()

    @classmethod
    def query_by_order(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(cls.ordr)

class Episode(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    typ = ndb.StringProperty()
    url = ndb.StringProperty()
    updt = ndb.DateTimeProperty()
    dur = ndb.IntegerProperty()
    like = ndb.IntegerProperty()
    hate = = ndb.IntegerProperty()
    
class Channel(ndb.Model):
    name = ndb.StringProperty(indexed=True)
    category = ndb.StringProperty(indexed=True)
    image = ndb.StringProperty()
    desc = ndb.StringProperty()
    like = ndb.IntegerProperty()
    hate = ndb.IntegerProperty()
    updt = ndb.DateTimeProperty()
    rnk = ndb.IntegerProperty()
    rnkmon = ndb.IntegerProperty()
    rnktue = ndb.IntegerProperty()
    rnkwed = ndb.IntegerProperty()
    rnkthu = ndb.IntegerProperty()
    rnkfri = ndb.IntegerProperty()
    rnksat = ndb.IntegerProperty()
    rnksun = ndb.IntegerProperty()
    rnk10  = ndb.IntegerProperty()
    rnk20  = ndb.IntegerProperty()
    rnk30  = ndb.IntegerProperty()
    rnk40  = ndb.IntegerProperty()
    rnk50  = ndb.IntegerProperty()
    rnk60  = ndb.IntegerProperty()
    rnk70  = ndb.IntegerProperty()
    rnkman = ndb.IntegerProperty()
    rnkwom = ndb.IntegerProperty()
    episodes = ndb.StructuredProperty(Episode, repeated=True)

    @classmethod
    def query_by_category(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.category)

    @classmethod
    def desc_rnk(cls, ancestor_key, x):
        if x == 'rnk':            
            return cls.query(ancestor=ancestor_key).order(-cls.rnk)
        elif x == 'rnkmon'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkmon)
        elif x == 'rnktue'
            return cls.query(ancestor=ancestor_key).order(-cls.rnktue)
        elif x == 'rnkwed'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkwed)
        elif x == 'rnkthu'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkthu)
        elif x == 'rnkfri'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkfri)
        elif x == 'rnksat'
            return cls.query(ancestor=ancestor_key).order(-cls.rnksat)
        elif x == 'rnksun'
            return cls.query(ancestor=ancestor_key).order(-cls.rnksun)
        elif x == 'rnk10'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk10)
        elif x == 'rnk20'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk20)
        elif x == 'rnk30'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk30)
        elif x == 'rnk40'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk40)
        elif x == 'rnk50'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk50)
        elif x == 'rnk60'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk60)
        elif x == 'rnk70'
            return cls.query(ancestor=ancestor_key).order(-cls.rnk70)
        elif x == 'rnkman'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkman)
        elif x == 'rnkwom'
            return cls.query(ancestor=ancestor_key).order(-cls.rnkwom)

# for app 
# 1. get top channel by age
# 2. get top channel by general ranking
# 3. get top channel by category
# 4. get top channel by week 
# 
# 5. update age rank of channel 
# 6. update week rank of channel
# 7. update general rank of channel 
# 
# 
# for grep from podjjang
# 1. category fix
# 2. input channel per category id of podjjang
# 3. input episode per channel id of podjjang



class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

app = webapp2.WSGIApplication([
    ('/', MainHandler)
], debug=True)
