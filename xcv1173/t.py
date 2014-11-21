#-*- coding: utf-8 -*-
import time
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

# import webapp2
# import simplejson as json
# from google.appengine.ext import ndb
# from google.appengine.api import users
# from google.appengine.api import taskqueue
# from google.appengine.api import memcache

import jinja2
import os
from random import randint

def read_videopage_url(url):
  google_res = urllib2.urlopen(url)
  content = google_res.read()
  dataus = re.findall(r'<div class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
  iframedt = re.search(r'<iframe [\d\w\=\"\ ]+ src="[\/\w\d]+"', content, re.M|re.I)
  b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

  result = [] 
  if dataus:
    for i, d in enumerate(dataus):
      try:
        result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])) })
      except IndexError:
        pass
  elif iframedt:
    http_url = re.search(r'http://[a-zA-Z\.]+\/', url, re.M|re.I)
    http_uri = re.search(r'src="[\d\w\/]+"', iframedt.group(), re.M|re.I)
    http_uri = http_uri.group().replace('src=','').replace('"','')
    print http_url.group()+'/'+http_uri
    google_res = urllib2.urlopen(http_url.group()+'/'+http_uri)
    content = google_res.read()
    idataus = re.findall(r'<source[\ \"\d\w\s]e-src="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)
    # print idataus
    for i, d in enumerate(idataus):
      try:
        print 
        result.append({'url':decodeUrl(extattr(b.group()), extattr(idataus[i])) })
      except IndexError:
        pass

    return result

def read_listresult_url(q, url, cur_page, max_page):
  print 'def read_listresult_url(q, url, cur_page, max_page) ' + str(url) + ':' + str(cur_page) + ':' + str(max_page)
  if cur_page > max_page:
    return
  cur_page += 1
  google_res = urllib2.urlopen(url)
  content = google_res.read()
  # print content
  dataus = re.findall(r'<a class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
  names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
  images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
  b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

  result = [] 
  # print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
  if dataus and names and images:
    for (i, d) in enumerate(dataus):
      # print images[i]      unicode(writer,  "euc-kr").encode("utf-8", "ignore")
      try:
        nm = extcont(names[i])

        if nm:
          nm = nm.decode('utf-8', 'ignore')
          # if q in nm:
          if q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''):
            result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm, 'image':extattr(images[i])  })
      except IndexError as e:
        print "IndexError error: {0}".format(str(e))
      except AttributeError as e:
        print "AttributeError error({0}): {1}".format(e.errno, e.strerror)
        pass
  # print '--------------------------------------'
  # print result 
  # print '--------------------------------------'
  more_container = re.search(r'<ul class="pagination"><li class[\=\"\d\w\s\>\<\/\-\?]*<span',content, re.M|re.I)
  if more_container:
    print more_container.group()
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

        # print aurl
        aaa = read_listresult_url(q, aurl, cur_page, max_page)
        if aaa:
          result += aaa
        return result
    # print '--- return ----'      
    # print result 
  return result

def read_searchresult_url(q, url):
  google_res = urllib2.urlopen(url)
  content = google_res.read()
  contents = re.search(r'미드(.*)</h5>(.*)', content, re.M|re.I)

  more = re.search(r'href="/finder(.*)">영상 목록 검색 결과 더보기',content, re.M|re.I)
  if contents: 
    kcontent = contents.group()

  dataus = re.findall(r'<a class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
  names = re.findall(r'<span class="name">[^\<\>]*</span>',content, re.M|re.I)
  images = re.findall(r'<img src="http://[^\<]*',content, re.M|re.I)
  b = re.search(r'<div b=".*" id="jkr"', content, re.M|re.I)

  result = [] 
  # print str(len(dataus)) + ':' + str(len(names)) + ':' + str(len(images))
  if dataus and names and images:
    for i, d in enumerate(dataus):
      # ## print images[i]      unicode(writer,  "euc-kr").encode("utf-8", "ignore")
      try:
        nm = extcont(names[i])
        if nm:
          nm = nm.decode('utf-8', 'ignore')
          # print 'result---->' +  nm.encode('utf-8').replace(' ','')
          # print 'result---->' + q.encode('utf-8').replace(' ','')
          if q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''):
            # print 'result---->' + str(q.encode('utf-8').replace(' ','') in nm.encode('utf-8').replace(' ',''))
            result.append({'url':decodeUrl(extattr(b.group()), extattr(dataus[i])), 'name':nm, 'image':extattr(images[i])  })
      except IndexError:
        pass

    if more:
      http_url = re.search(r'http://[a-zA-Z\.]+\/', url, re.M|re.I)
      moreurl = extmore(more.group())
      result = read_searchresult_url(q, http_url.group() + '/' + moreurl)
    # print result
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
  # google_res = opener.open(url)
  # ## print google_res.info().get('Content-Encoding')
  if google_res.info().get('Content-Encoding') == 'gzip':
    buf = StringIO( google_res.read() )
    f = gzip.GzipFile(fileobj=buf)
    content = f.read()

    # dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    dataus = re.search(r'var batchDataList=\[\{(.*)\;</script>', content, re.M|re.I)
    # ## print dataus
    if dataus:
      d1 = dataus.group()
      d2 = re.search(r'=\[(.*);', d1, re.M|re.I)
      d3 = d2.group()
      d3 = d3[1:len(d3)-1]

      d3 = json.loads(d3);
      # ## print d3
      # now d3 is object 
      for d in d3:
        # ## print d
        istr = 'http://tv03.search.naver.net/nhnsvc?size=42x60&q=http://sstatic.naver.net/keypage/image/dss/'+d['posterImgUrl'] 
        name = d['broadcastName']

        name = re.sub(r'시즌', '', name.encode('utf-8','ignore'))
        name = re.sub(r'((\s)+(\d))*', '', name)
        mt = MovieTitle.query(MovieTitle.name==name).fetch(1)
        # rk = gRankUrl(name + ' 미드')
        rk = 0
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
  ## print google_res.info().get('Content-Encoding')
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
  print 'begin new_fetch_movies ... '
  print q.encode('utf-8')
  result = read_searchresult_url(q, 'http://searchpang.com/finder?q='+urllib.quote(q.encode('utf-8'))+'&search_tags%5B%5D='+urllib.quote("미드") +'&category=list')
  print '------------- read_searchresult_url result is '
  # print result

  isMovie = True
  for r in result: # movie items
    print 'new_fetch_movies url is '  + r['name'].encode('utf-8')
    r['items'] = read_listresult_url(q, r['url'], 1, 1)
    # print '------------- read_listresult_url result is '
    print r['items']
    if r is not None and r['items'] is not None:
      for s in r['items']: # item player  
        isMovie = False
        p = read_videopage_url(s['url']) # player url
        ## print str(s['url']) + '===' + str(p)
        if p and len(p):
          s['embed'] = p[0]['url']
        else:
          s['embed'] = ''
 
      # print str(movie)

if __name__ == '__main__':
  # new_fetch_movies('워킹 데드'.decode('utf-8'))
  print '--------------0000-----------------'
  # print read_listresult_url('워킹 데드'.decode('utf-8'), 'http://searchpang.com/p/s/1eccwci/stream', 1, 1)
  print read_videopage_url('http://mentplus.com/m/v/3hjq28d')

