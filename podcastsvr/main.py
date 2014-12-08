#-*- coding: utf-8 -*-
import os
import time
import webapp2
import webapp2_extras
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

from random import randint
from google.appengine.api import memcache

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

def default(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
    millis = int(
        calendar.timegm(obj.timetuple()) * 1000 +
        obj.microsecond / 1000
    )
    return millis

class Category(ndb.Model):
    seq = ndb.IntegerProperty(indexed=True)
    name = ndb.StringProperty(indexed=True)
    date = ndb.DateTimeProperty(auto_now_add=True)
    order = ndb.IntegerProperty()

    @classmethod
    def query_category(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(cls.order)

class Episode(ndb.Model):
    seq = ndb.IntegerProperty(indexed=True)
    name = ndb.StringProperty(indexed=True)
    typ = ndb.StringProperty()
    url = ndb.StringProperty()
    updt = ndb.DateTimeProperty()
    dur = ndb.IntegerProperty()
    like = ndb.IntegerProperty()
    hate = ndb.IntegerProperty()

    @classmethod
    def query(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.seq)
    
class Channel(ndb.Model):
    seq = ndb.IntegerProperty(indexed=True)
    name = ndb.StringProperty(indexed=True)
    category_seq = ndb.StringProperty(indexed=True)
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
    def query_channel(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.seq)

    @classmethod
    def query_by_rnk(cls, ancestor_key, x):
        if x == 'rnk':            
            return cls.query(ancestor=ancestor_key).order(-cls.rnk)
        elif x == 'rnkmon':
            return cls.query(ancestor=ancestor_key).order(-cls.rnkmon)
        elif x == 'rnktue':
            return cls.query(ancestor=ancestor_key).order(-cls.rnktue)
        elif x == 'rnkwed':
            return cls.query(ancestor=ancestor_key).order(-cls.rnkwed)
        elif x == 'rnkthu':
            return cls.query(ancestor=ancestor_key).order(-cls.rnkthu)
        elif x == 'rnkfri':
            return cls.query(ancestor=ancestor_key).order(-cls.rnkfri)
        elif x == 'rnksat':
            return cls.query(ancestor=ancestor_key).order(-cls.rnksat)
        elif x == 'rnksun':
            return cls.query(ancestor=ancestor_key).order(-cls.rnksun)
        elif x == 'rnk10':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk10)
        elif x == 'rnk20':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk20)
        elif x == 'rnk30':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk30)
        elif x == 'rnk40':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk40)
        elif x == 'rnk50':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk50)
        elif x == 'rnk60':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk60)
        elif x == 'rnk70':
            return cls.query(ancestor=ancestor_key).order(-cls.rnk70)
        elif x == 'rnkman':
            return cls.query(ancestor=ancestor_key).order(-cls.rnkman)
        elif x == 'rnkwom':
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

class UpRank(webapp2.RequestHandler):
    def post(self):
        content = self.request.body
        print '-----------------'
        print str(self.request.body)
        print '-----------------'
        data = json.loads(content)
        for d in data:
            channel_key = ndb.Key('Channel', 'all', 'Category', d['category_seq'] or '*noseq*',  'Seq', d['seq'] or '*noseq*')
            channels = Channel.query_channel(channel_key).fetch(1)
            for ch in channels:
                ch.like = ch.like+1 if 'like' in d and d['like'] is not None else ch.like
                ch.hate = ch.hate+1 if 'hate' in d and d['hate'] is not None else ch.hate
                ch.rnk = ch.rnk+1 if 'rnk' in d and d['rnk'] is not None else ch.rnk
                ch.rnkmon = ch.rnkmon+1 if 'rnkmon' in d and d['rnkmon'] is not None else ch.rnkmon
                ch.rnktue = ch.rnktue+1 if 'rnktue' in d and d['rnktue'] is not None else ch.rnktue
                ch.rnkwed = ch.rnkwed+1 if 'rnkwed' in d and d['rnkwed'] is not None else ch.rnkwed
                ch.rnkthu = ch.rnkthu+1 if 'rnkthu' in d and d['rnkthu'] is not None else ch.rnkthu
                ch.rnkfri = ch.rnkfri+1 if 'rnkfri' in d and d['rnkfri'] is not None else ch.rnkfri
                ch.rnksat = ch.rnksat+1 if 'rnksat' in d and d['rnksat'] is not None else ch.rnksat
                ch.rnksun = ch.rnksun+1 if 'rnksun' in d and d['rnksun'] is not None else ch.rnksun
                ch.rnk10 = ch.rnk10+1 if 'rnk10' in d and d['rnk10'] is not None else ch.rnk10
                ch.rnk20 = ch.rnk20+1 if 'rnk20' in d and d['rnk20'] is not None else ch.rnk20
                ch.rnk30 = ch.rnk30+1 if 'rnk30' in d and d['rnk30'] is not None else ch.rnk30
                ch.rnk40 = ch.rnk40+1 if 'rnk40' in d and d['rnk40'] is not None else ch.rnk40
                ch.rnk50 = ch.rnk50+1 if 'rnk50' in d and d['rnk50'] is not None else ch.rnk50
                ch.rnk60 = ch.rnk60+1 if 'rnk60' in d and d['rnk60'] is not None else ch.rnk60
                ch.rnk70 = ch.rnk70+1 if 'rnk70' in d and d['rnk70'] is not None else ch.rnk70
                ch.rnkman = ch.rnkman+1 if 'rnkman' in d and d['rnkman'] is not None else ch.rnkman
                ch.rnkwom = ch.rnkwom+1 if 'rnkwom' in d and d['rnkwom'] is not None else ch.rnkwom
                ch.put()

class AddChannel(webapp2.RequestHandler):
    def post(self):
        content = self.request.body
        print '-----------------'
        print str(self.request.body)
        print '-----------------'
        data = json.loads(content)
        for d in data:
            channel_key = ndb.Key('Channel', 'all', 'Category', d['category_seq'] or '*noseq*',  'Seq', d['seq'] or '*noseq*')
            channels = Channel.query_channel(channel_key).fetch(1)
            if channels is None or len(channels) < 1:
                print 'new channel : ' + str(channels)
                ch = Channel(parent=ndb.Key('Channel', 'all','Category', d['category_seq'] or '*noseq*',  'Seq', d['seq'] or '*noseq*')
                        ,seq = d['seq']
                        ,name = d['title']
                        ,category_seq = d['category_seq']
                        ,image = d['thumb']
                        ,desc = d['desc']
                        ,like = 1
                        ,hate = 1
                        ,rnk = 1
                        ,rnkmon = 1
                        ,rnktue = 1
                        ,rnkwed = 1
                        ,rnkthu = 1
                        ,rnkfri = 1
                        ,rnksat = 1
                        ,rnksun = 1
                        ,rnk10  = 1
                        ,rnk20  = 1
                        ,rnk30  = 1
                        ,rnk40  = 1
                        ,rnk50  = 1
                        ,rnk60  = 1
                        ,rnk70  = 1
                        ,rnkman = 1
                        ,rnkwom = 1
                    )
                ch.put()
                print ch
            else:
                print 'old channel : ' + str(channels)
                for ch in channels:
                    ch.image = d['thumb'] if 'thumb' in d and d['thumb'] is not None else ch.image
                    ch.desc = d['desc'] if 'desc' in d and d['desc'] is not None else ch.desc
                    ch.like = d['like'] if 'like' in d and d['like'] is not None else ch.like
                    ch.hate = d['hate'] if 'hate' in d and d['hate'] is not None else ch.hate
                    ch.rnk = d['rnk'] if 'rnk' in d and d['rnk'] is not None else ch.rnk
                    ch.rnkmon = d['rnkmon'] if 'rnkmon' in d and d['rnkmon'] is not None else ch.rnkmon
                    ch.rnktue = d['rnktue'] if 'rnktue' in d and d['rnktue'] is not None else ch.rnktue
                    ch.rnkwed = d['rnkwed'] if 'rnkwed' in d and d['rnkwed'] is not None else ch.rnkwed
                    ch.rnkthu = d['rnkthu'] if 'rnkthu' in d and d['rnkthu'] is not None else ch.rnkthu
                    ch.rnkfri = d['rnkfri'] if 'rnkfri' in d and d['rnkfri'] is not None else ch.rnkfri
                    ch.rnksat = d['rnksat'] if 'rnksat' in d and d['rnksat'] is not None else ch.rnksat
                    ch.rnksun = d['rnksun'] if 'rnksun' in d and d['rnksun'] is not None else ch.rnksun
                    ch.rnk10 = d['rnk10'] if 'rnk10' in d and d['rnk10'] is not None else ch.rnk10
                    ch.rnk20 = d['rnk20'] if 'rnk20' in d and d['rnk20'] is not None else ch.rnk20
                    ch.rnk30 = d['rnk30'] if 'rnk30' in d and d['rnk30'] is not None else ch.rnk30
                    ch.rnk40 = d['rnk40'] if 'rnk40' in d and d['rnk40'] is not None else ch.rnk40
                    ch.rnk50 = d['rnk50'] if 'rnk50' in d and d['rnk50'] is not None else ch.rnk50
                    ch.rnk60 = d['rnk60'] if 'rnk60' in d and d['rnk60'] is not None else ch.rnk60
                    ch.rnk70 = d['rnk70'] if 'rnk70' in d and d['rnk70'] is not None else ch.rnk70
                    ch.rnkman = d['rnkman'] if 'rnkman' in d and d['rnkman'] is not None else ch.rnkman
                    ch.rnkwom = d['rnkwom'] if 'rnkwom' in d and d['rnkwom'] is not None else ch.rnkwom
                    ch.put()


class AddCategory(webapp2.RequestHandler):
    def post(self):
        content = self.request.body
        print '-----' 
        print content
        print '-----' 
        data = json.loads(content)
        for d in data:
            cate_key = ndb.Key('Category', 'all', 'Seq', d['seq'] or '*noseq*')
            cates = Category.query_category(cate_key).fetch(1)
            if cates is None or len(cates) < 1 :
                print 'new cate : ' + str(cates)
                cate = Category(parent=ndb.Key('Category', 'all', 'Seq', d['seq'] or '*noseq*')
                    , seq  = d['seq']
                    , name = d['title']
                    , order = d['order']
                        )
                cate.put()
            else:
                print 'old cate : ' + str(cates)
                for cate in cates:
                    cate.seq  = d['seq']
                    cate.name = d['title']
                    cate.order = d['order']
                    cate.put()

class listCategory(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'application/json'
        cate_key = ndb.Key('Category', 'all')
        cates = Category.query_category(cate_key).fetch()
        self.response.out.write(json.dumps([p.to_dict() for p in cates],default=default))

class rankChannel(webapp2.RequestHandler):
    def get(self):
        print 'listChannel : ' + self.request.get('rank')
        self.response.headers['Content-Type'] = 'application/json'
        ch_key = ndb.Key('Channel', 'all')
        channels = Channel.query_by_rnk(ch_key, self.request.get('rank')).fetch()
        self.response.out.write(json.dumps([p.to_dict() for p in channels],default=default))

class cateChannel(webapp2.RequestHandler):
    def get(self):
        print 'listChannel : ' + self.request.get('category_seq')
        self.response.headers['Content-Type'] = 'application/json'
        ch_key = ndb.Key('Channel', 'all', 'Category', self.request.get('category_seq'))
        channels = Channel.query_by_rnk(ch_key, 'rnk').fetch()
        self.response.out.write(json.dumps([p.to_dict() for p in channels],default=default))


class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

app = webapp2.WSGIApplication([
    ('/channel/uprank', UpRank),   # get Movie from url q 
    ('/channel/add', AddChannel),   # get Movie from url q 
    ('/category/add', AddCategory),   # get Movie from url q 
    ('/category/list', listCategory),   # get Movie from url q 
    ('/channel/rank', rankChannel),   # get Movie from url q 
    ('/channel/cate', cateChannel),   # get Movie from url q 

], debug=True)
