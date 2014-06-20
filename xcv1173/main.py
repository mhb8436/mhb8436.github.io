#-*- coding: utf-8 -*-
import time
import webapp2
# import simplejson as json
import csv
import sys, time
import re
import urllib
import urllib2
# import simplejson as json
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

class Notice(ndb.Model):
  content = ndb.StringProperty()
  date = ndb.DateTimeProperty(auto_now_add=True)

  @classmethod
  def query_notice(cls, ancestor_key):
    return cls.query(ancestor=ancestor_key).order(-cls.date)

class MovieItem(ndb.Model):
  url = ndb.StringProperty()
  name = ndb.StringProperty()
  image = ndb.StringProperty()
  embed = ndb.StringProperty()


class Movie(ndb.Model):
  url = ndb.StringProperty()
  name = ndb.StringProperty(indexed=True)
  image = ndb.StringProperty()
  items = ndb.StructuredProperty(MovieItem, repeated=True)

  @classmethod
  def query_movie(cls, ancestor_key):
    return cls.query(ancestor=ancestor_key).order(-cls.name)


class MovieTitle(ndb.Model):
  name = ndb.StringProperty(indexed=True)
  image = ndb.StringProperty()
  rank = ndb.IntegerProperty()

  @classmethod
  def query_movie(cls, ancestor_key):
    return cls.query(ancestor=ancestor_key).order(-cls.rank)
# class Greeting(db.Model):
#   """Models an individual Guestbook entry with an author, content, and date."""
#   author = db.StringProperty()
#   content = db.StringProperty(multiline=True, indexed=False)
#   date = db.DateTimeProperty(auto_now_add=True)


# def _GuestbookKey(guestbook_name=None):
#   """Constructs a Datastore key for a Guestbook entity with guestbook_name."""
#   return db.Key.from_path('Guestbook', guestbook_name or 'default_guestbook')
def read_videopage_url(url):
  #print 'read_videopage_url ' + url

  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  #print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()

    # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    dataus = re.findall(r'<div class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    # names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
    # images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
    b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

    result = [] 
    #print str(len(dataus))
    if dataus:
      for i, d in enumerate(dataus):
        # #print images[i]      unicode(writer,  "euc-kr").encode("utf-8", "ignore")
        try:
          # nm= extcont(names[i])
          # #print nm
          result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])) })
        except IndexError:
          pass

    return result

def read_listresult_url(q, url, cur_page, max_page):
  #print 'read_listresult_url ' + url
  print 'read_listresult_url(q, url, cur_page=1, max_page=1): ' + str(cur_page) + '==' + str(max_page)
  if cur_page > max_page:
    return
  cur_page += 1
  # content = f.read()
  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  #print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()


    dataus = re.findall(r'<a class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
    images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
    b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

    result = [] 
    #print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
    if dataus and names and images:
      for (i, d) in enumerate(dataus):
        # #print images[i]      unicode(writer,  "euc-kr").encode("utf-8", "ignore")
        try:
          nm = extcont(names[i])

          if nm:
            nm = nm.decode('utf-8', 'ignore')
            # if q in nm:
            if q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''):
              result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm, 'image':extattr(images[i])  })
        except IndexError, AttributeError:
          print 'error'
          pass
    print '--------'      
    print result 
    more_container = re.search(r'<ul class="pagination"><li class[\=\"\d\w\s\>\<\/\-\?]*<span',content, re.M|re.I)
    if more_container:
      #print more_container.group()
      more2 = re.search(r'<li class="first[\s\w]*"><a href="[\/\d\w\?\=]*"(.)*</li><li class="last', more_container.group(), re.M|re.I)
      if more2:
        more = re.findall(r'<a href="[\/\d\w\?\=]*"', more2.group(), re.M|re.I)
        fix_url = re.search(r'<a href="[\/\d\w]*"', more_container.group(), re.M|re.I)
        if max_page == 1:
          max_page = len(more)
        for i in more:          
          moreurl = extmore(i)
          http_url = re.search(r'http://[a-zA-Z\.]+\/', url, re.M|re.I)
          if 'page=' in moreurl:
            moreurl = re.sub(r'page=(\d)*','page='+str(cur_page), moreurl)
            aurl = http_url.group() + moreurl
          else:
            aurl = http_url.group() + moreurl + '?page=' + str(cur_page)

          print aurl
          aaa = read_listresult_url(q, aurl, cur_page, max_page)
          if aaa:
            result += aaa
          return result
            
    return result

def read_searchresult_url(q, url):
  #print 'read_searchresult_url ' + url

  # content = f.read()
  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  #print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()
    contents = re.search(r'미드(.*)</h5>(.*)', content, re.M|re.I)
    #print contents 

    more = re.search(r'href="/finder(.*)">영상 목록 검색 결과 더보기',content, re.M|re.I)
    if contents: 
      kcontent = contents.group()

    dataus = re.findall(r'<a class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', kcontent, re.M|re.I)
    names = re.findall(r'<span class="name">[^\<\>]*</span>',kcontent, re.M|re.I)
    images = re.findall(r'<img src="http://[^\<]*',kcontent, re.M|re.I)
    b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

    result = [] 
    #print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
    if dataus and names and images:
      for i, d in enumerate(dataus):
        # #print images[i]      unicode(writer,  "euc-kr").encode("utf-8", "ignore")
        try:
          nm = extcont(names[i])
          if nm:
            nm = nm.decode('utf-8', 'ignore')
            print 'result---->' +  nm.encode('utf-8').replace(' ','')
            print 'result---->' + q.encode('utf-8').replace(' ','')
            if q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''):
              print 'result---->' + str(q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''))
              result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm, 'image':extattr(images[i])  })
        except IndexError:
          pass

    if more:
      http_url = re.search(r'http://[a-zA-Z\.]+\/', url, re.M|re.I)
      moreurl = extmore(more.group())
      result += read_searchresult_url(q, http_url.group() + moreurl)
    print result
    return result

def extattr(str):
  a = re.search(r'"[a-zA-Z0-9\=\/\:\.\_\,]{3,}"', str, re.M|re.I)
  if a:
    return a.group().replace('"','').replace('>','').replace('<','')

def extcont(str):
  a = re.search(r'>.*<', str, re.M|re.I)
  if a:
    return a.group().replace('"','').replace('>','').replace('<','')

def extmore(str):
  a = re.search(r'"(.*)"', str, re.M|re.I)
  if a:
    return a.group().replace('"','').replace('>','').replace('<','')


def decodeUrl(e, t):
  _e = re.sub(r'[A-Z]', "", e)  
  e1 = list(_e)
  t1 = list(t)
  r = []
  for t_ in t1:
    if t_ in e1:
      r.append(e1[int(t_, 36)])
    else:
      r.append(t_)
  return base64.b64decode(''.join(r))

def nhnUrl():
  url = 'http://m.search.naver.com/search.naver?where=nexearch&query=%EB%AF%B8%EA%B5%AD+%EB%93%9C%EB%9D%BC%EB%A7%88&sm=top_hty&fbm=1&ie=utf8'
  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('Cache-Control','max-age=0')
    ,('Connection','keep-alive')
    ,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  # #print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()

    # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    dataus = re.search(r'var batchDataList=\[\{(.*)\;</script>', content, re.M|re.I)
    # #print dataus
    if dataus:
      d1 = dataus.group()
      d2 = re.search(r'=\[(.*);', d1, re.M|re.I)
      d3 = d2.group()
      d3 = d3[1:len(d3)-1]

      d3 = json.loads(d3);
      # #print d3
      # now d3 is object 
      for d in d3:
        # #print d
        istr = 'http://tv03.search.naver.net/nhnsvc?size=42x60&q=http://sstatic.naver.net/keypage/image/dss/'+d['posterImgUrl'] 
        name = d['broadcastName']

        name = re.sub(r'시즌', '', name.encode('utf-8','ignore'))
        name = re.sub(r'((\s)+(\d))*', '', name)
        mt = MovieTitle.query(MovieTitle.name==name).fetch(1)
        rk = gRankUrl(name + ' 미드')
        # rk = 0
        if rk is None:
          rk = 0
        if mt is None or len(mt) < 1:
          movie_title = MovieTitle(
            parent=ndb.Key("MovieTitle", "TitleList"),
            name= name,
            image=istr,
            rank=rk
            )
          movie_title.put()   

def gRankUrl(q):
  q = q + ' 미드'
  from google.appengine.api import urlfetch
  url = 'https://www.google.com/search?q=' + urllib.quote(q)
  result = urlfetch.fetch(url)
  # print result.status_code
  if result.status_code == 200:
    content = result.content
    # print result.content
    dataus = re.search(r'"resultStats">About(\s)*[\d\,]*', content, re.M|re.I)
    if dataus:
      d1 = dataus.group()
      d2 = re.findall(r'[(\d)\,]*', d1, re.M|re.I)
      d3 = int(''.join(d2).replace(',',''))
      # print d3
      return d3
      
  # opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  # urllib2.install_opener(opener)
  
  # opener.addheaders = [
  #    ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
  #   ,('accept-encoding','gzip,deflate,sdch')
  #   ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
  #   ,('Cache-Control','max-age=0')
  #   ,('Connection','keep-alive')
  #   ,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
  #   ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  # ]
  # google_res = opener.open(url + '?q='+urllib.quote(q))
  # #print google_res.info().get('Content-Encoding')
  # if google_res.info().get('Content-Encoding') == 'gzip':
  #   buf = StringIO( google_res.read() )
  #   f = gzip.GzipFile(fileobj=buf)
  #   content = f.read()

  #   # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
  #   dataus = re.search(r'<div id="resultStats">About(\s)*[\d\,]*', content, re.M|re.I)
  #   if dataus:
  #     d1 = dataus.group()
  #     # #print d1
  #     d2 = re.findall(r'[(\d)\,]*', d1, re.M|re.I)
  #     # #print d2
  #     # d3 = d2.group()
  #     # #print ''.join(d2)
  #     d3 = int(''.join(d2).replace(',',''))
  #     # #print str(d3)
  # return d3    

def nhnImgUrl(q):
  q = q + ' 미드'
  url = 'http://image.search.naver.com/search.naver?where=image&sm=tab_jum&ie=utf8&query=' + urllib.quote(q)
  opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
  urllib2.install_opener(opener)
  
  opener.addheaders = [
     ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    ,('accept-encoding','gzip,deflate,sdch')
    ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
    ,('Cache-Control','max-age=0')
    ,('Connection','keep-alive')
    ,('Cookie','NNB=XUJD6C54DNDFE; npic=EXrsp7gmY44+BZsTrgtkrPUB04GxImrzgZ6Km6JasZMtzakgZW5qmnbIy02LuEDuCA==; page_uid=RHrDlspySDdssZSSWDZsss--325184; _naver_usersession_=U5rldnHAmVMAADKUql0; BMR=')
    ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
  ]
  google_res = opener.open(url)
  #print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()

    # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    dataus = re.search(r'oLoadImageSource[\s]*\=(\s)*\{(\s)*img1[^\,]*', content, re.M|re.I)
    if dataus:
      d1 = dataus.group()
      d2 = re.search(r'"(.*)', d1, re.M|re.I)
      d3 = d2.group()
      d3 = d3[1:len(d3)-1]
      return d3



def new_fetch_movies(q):
  #print 'begin new_fetch_movies ... '
  #print q.encode('utf-8')
  result = read_searchresult_url(q, 'http://searchpang.com/finder?q='+urllib.quote(q.encode('utf-8'))+'&search_tags%5B%5D='+urllib.quote("미드") )
  #print result
  isMovie = True
  for r in result: # movie items
    r['items'] = read_listresult_url(q, r['url'], 1, 1)
    for s in r['items']: # item player  
      isMovie = False
      p = read_videopage_url(s['url']) # player url
      #print str(s['url']) + '===' + str(p)
      if p and len(p):
        s['embed'] = p[0]['url']
      else:
        s['embed'] = ''
  
  if isMovie:
    mt = MovieTitle.query(MovieTitle.name==q.encode('utf-8')).fetch()
    for m in mt:
      print str(m.key.delete())


  # print 'new fetch movies result is ' + str(len(result))
  for (i, r) in enumerate(result):    
    #print '-----------> ' + str(i) + ' ' + r['name'].encode('utf-8','ignore')
    item_s = []
    for i in r['items']:
      #print 'item->' + i['name'].encode('utf-8','ignore') 
      # #print i['name']
      if i['embed'] == '':
        continue
      nm =   i['name'].encode('utf-8','ignore')
      nm = nm.replace('&lt;','').replace('&gt;','')

      item = MovieItem( 
        name=nm,
        url=i['url'],
        image=i['image'],
        embed=i['embed']
        )
      item_s.append(item)

    print 'item length is ' + str(len(item_s))
    if len(item_s) > 0:
      # already = Movie.query(Movie.name == r['name'].encode('utf-8','ignore')).fetch(1)
      # print 'already is ' + str(len(already))
      # if len(already) < 1:
      movie = Movie(
        parent=ndb.Key("Movie", q.encode('utf-8','ignore')),
        name=r['name'].encode('utf-8','ignore'),
        url=r['url'],
        image=r['image'],
        items=item_s
        )
      print 'movie->' + r['name'].encode('utf-8','ignore')   
      movie.put()
      
      print movie

# def delete_movies(q):
#   ancestor_key = ndb.Key("Movie", q.encode('utf-8') or "*notitle*")
#   mm = Movie.query_movie(ancestor_key).fetch()
#   for m in mm:
#     if m:
#       print ' delete rows is ' + str(m)
#       print str(m.key.delete())

# class Werisdfls51Page(webapp2.RequestHandler):
#   def get(self):
#     ancestor_key = ndb.Key("MovieTitle", "TitleList")
#     mm = MovieTitle.query_movie(ancestor_key).fetch()
#     for m in mm:
#       if m:
#         print ' delete rows is ' + str(m)
#         print str(m.key.delete())
#     nhnUrl()
#     self.response.headers['Content-Type'] = 'application/json'
#     self.response.out.write(json.dumps([p.to_dict() for p in MovieTitle.query_movie(ancestor_key).fetch()]))

class Wfr4Page(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')    
    #print 'Wfr4Page get ' + str(q.encode('utf-8'))
    # delete_movies(q)
    new_fetch_movies(q)
    #print 'is called new_fetch_movies '
    self.response.headers['Content-Type'] = 'application/json'
    # self.response.out.write(json.dumps(movies))
    ancestor_key = ndb.Key("Movie", q.encode('utf-8') or "*notitle*")
    self.response.out.write(json.dumps([p.to_dict() for p in Movie.query_movie(ancestor_key).fetch()]))

# class Wfr4Page(webapp2.RequestHandler):
#   def get(self):
#     q = self.request.get('q')    
#     #print 'Wfr4Page get ' + str(q.encode('utf-8'))
#     delete_movies(q)
#     new_fetch_movies(q)
#     #print 'is called new_fetch_movies '
#     self.response.headers['Content-Type'] = 'application/json'
#     # self.response.out.write(json.dumps(movies))
#     ancestor_key = ndb.Key("Movie", q.encode('utf-8') or "*notitle*")
#     self.response.out.write(json.dumps([p.to_dict() for p in Movie.query_movie(ancestor_key).fetch()]))


class PutNotice(webapp2.RequestHandler):
  def get(self):
    ancestor_key = ndb.Key("uid01", 'owdksldf')
    # notices = Notice.query_notice(ancestor_key).fetch(1)
    notices = Notice(parent=ndb.Key("uid01", 'owdksldf'),
                        content = self.request.get('content'))
    notices.put()

class GetNotice(webapp2.RequestHandler):
  def get(self):
    ancestor_key = ndb.Key("uid01", 'owdksldf')
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps([p.content for p in Notice.query_notice(ancestor_key).fetch(1)]))



class Ewdfosid21Page(webapp2.RequestHandler):
  def get(self):
    # gRankUrl('왕좌의 게임')
    q = self.request.get('q')
    m = MovieTitle.query(MovieTitle.name == q.encode('utf-8')).fetch(1)
    print m
    if len(m) < 1:
      img_url = nhnImgUrl(q.encode('utf-8'))
      rank = gRankUrl(q.encode('utf-8'))
      if img_url is None:
        img_url = ''
      movie_title = MovieTitle(
            parent=ndb.Key("MovieTitle", "TitleList"),
            name=q.encode('utf-8'),
            image=img_url,
            rank=rank
            )
      movie_title.put()
      
    ancestor_key = ndb.Key("MovieTitle", "TitleList")
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps([p.to_dict() for p in MovieTitle.query_movie(ancestor_key).fetch()]))

class Usoidsfjk12Page(webapp2.RequestHandler):
  # update rank from q
  def get(self):
    nm = self.request.get('nm')
    rnk = self.request.get('rnk')
    mm = MovieTitle.query(MovieTitle.name == nm.encode('utf-8')).fetch(1)
    # print mm
    for m in mm:
      if m:
        sandy = m.key.get()
        # if rnk is None:
        #   rnk = 0
        print 'rnk is ' + str(rnk)
        a = re.search(r'[\d]+', rnk, re.M|re.I)
        if rnk is not None and a:
          sandy.rank = int(rnk)
        else:
          sandy.rank = 0
        sandy.put()
    print mm    

class Ewdfosid62Page(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')
    mm = MovieTitle.query(MovieTitle.name == q.encode('utf-8')).fetch(1)
    #print mm
    aaa = [ m.key.delete() for m in mm if m]
    #print aaa
    ancestor_key = ndb.Key("MovieTitle", "TitleList")
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps([p.to_dict() for p in MovieTitle.query_movie(ancestor_key).fetch()]))

class Ewdfosid93Page(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')
    img_url = nhnImgUrl(q.encode('utf-8'))
    movie_title = MovieTitle(
            parent=ndb.Key("MovieTitle", "TitleList"),
            name=q.encode('utf-8'),
            image=img_url,
            rank=0
            )
    movie_title.put()
    # mm = MovieTitle.query(MovieTitle.name == q.encode('utf-8')).fetch(1)
    #print mm
    # aaa = [ m.key.delete() for m in mm if m]
    #print aaa
    ancestor_key = ndb.Key("MovieTitle", "TitleList")
    # self.response.headers['Content-Type'] = 'application/json'
    # self.response.out.write(json.dumps([p.to_dict() for p in MovieTitle.query_movie(ancestor_key).fetch()]))


class Durtka18Page(webapp2.RequestHandler):
  def post(self):  
    q = self.request.get('q')
    print 'statt Durtka18Page ' + q.encode('utf-8')
    if q:
      movielst = MovieTitle.query(MovieTitle.name == q.encode('utf-8')).fetch()
    else:  
      ancestor_key = ndb.Key("MovieTitle", "TitleList")
      movielst = MovieTitle.query_movie(ancestor_key).fetch()

    print movielst
    for p in movielst:
      dd =  p.to_dict()
      # delete_movies(dd['name'])
      new_fetch_movies(dd['name'])
      # time.sleep(randint(5,17))
      # time.sleep(60)
    if q:  
      ancestor_key = ndb.Key("Movie", q.encode('utf-8') or "*notitle*")
      self.response.headers['Content-Type'] = 'application/json'
      self.response.out.write(json.dumps([p.to_dict() for p in Movie.query_movie(ancestor_key).fetch()]))

class Durtka18PageHandler(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')
    taskqueue.add(url='/tasks/durtka18', params={'q': q})

  
class Ewdfosid71Page(webapp2.RequestHandler):
  def get(self):
    datas = memcache.get('%s:movietitle' % "TitleList")
    self.response.headers['Content-Type'] = 'application/json'
    if datas is not None:
      self.response.out.write(datas)
    else:
      ancestor_key = ndb.Key("MovieTitle", "TitleList")
      datas = json.dumps([p.to_dict() for p in MovieTitle.query_movie(ancestor_key).fetch()])
      if not memcache.add('%s:movietitle' % "TitleList", datas, 3600):
        print 'Memcache set fail of MovieTitle'
      self.response.out.write(datas)
      
class Eftfsog34Page(webapp2.RequestHandler):
  def get(self):
    q = self.request.get('q')   
    self.response.headers['Content-Type'] = 'application/json'
    datas = memcache.get('%s:movie' % q.encode('utf-8'))
    if datas is not None:
      self.response.out.write(datas)
    else:
      ancestor_key = ndb.Key("Movie", q.encode('utf-8') or "*notitle*")
      datas = json.dumps([p.to_dict() for p in Movie.query_movie(ancestor_key).fetch()])
      if not memcache.add('%s:movie' % q.encode('utf-8'), datas, 3600):
        print 'Memcache set fail of MovieTitle'
        self.response.out.write()

        
app = webapp2.WSGIApplication([
    ('/wfr4', Wfr4Page),
    ('/eftfsog34', Eftfsog34Page),   # get Movie from url q 
    ('/ewdfosid21', Ewdfosid21Page), # update image and ranking from MovieTiele
    ('/ewdfosid62', Ewdfosid62Page), # delete movie title from url q
    ('/ewdfosid93', Ewdfosid93Page), # add movie title from url q
    
    ('/ewdfosid71', Ewdfosid71Page), # get movietitle
    # ('/tasks/werisdfls', Werisdfls51Page), # fetch MovieTitle from naver 
    ('/tasks/durtka18', Durtka18Page), # fetch Movie from MovieTitle 
    ('/tasks/durtka18handler', Durtka18PageHandler), # fetch Movie from MovieTitle 
    ('/usoidsfjk12', Usoidsfjk12Page), # update rank from q 

    ('/oisdfuis43', PutNotice), # put Notice
    ('/osdisdfsid', GetNotice), # get Notice

    # Usoidsfjk12Page
], debug=True)
