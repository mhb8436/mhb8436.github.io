#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
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
from random import randint

_server_ = 'http://localhost:9080'
# _server_ = 'http://xcv1173.appspot.com/'

def get_data_from_url(url):
    opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
    urllib2.install_opener(opener)
    opener.addheaders = [
         ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
        ,('accept-encoding','gzip,deflate,sdch')
        ,('accept-language','en-US,en;q=0.8,ko;q=0.6')
        ,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
    ]
    try:
        res = opener.open(url)
        # print res.info().get('Content-Encoding')
        if res.info().get('Content-Encoding') == 'gzip':
            buf = StringIO( res.read() )
            f = gzip.GzipFile(fileobj=buf)
            data = f.read()
            return data
    except:
        pass

def parse_category(content):
    surl = _server_+'/category/add'
    data = re.findall(r'<section class="list">[\s\r\n]*<ul>[\s\w\"\n\r\=\<\>\/\W]*</ul>[\s\r\n]*</section>', content, re.M|re.I)
    newarr = []
    for i, d in enumerate(data):
        try:
            title = re.findall(r'(?<=<div class="txt">)[\W+]*(?=</div>)', d, re.M|re.I)
            url = re.findall(r'(?<=href=")[\w\s\d\/]*', d, re.M|re.I)
            for t, u in zip(title, url):
                # print t + '/' + u
                newarr.append({'seq':int(u.split('/')[3]),'title':t, 'order':int(u.split('/')[3])})
        except IndexError:
            pass 
    # print newarr
    req = urllib2.Request(surl)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req,json.dumps(newarr))
    reponse = f.read()
    f.close()    

def parse_channel(content):
    # print content
    url = _server_+'/channel/add'
    thumbs = re.findall(r'(?<=<div class="thumb"><img src=")[\w\:\/\.\d]+', content, re.I|re.M)
    titles = re.findall(r'(?<=<p>)(\W+|[^\<]+)(?=</p>)', content, re.I|re.M)
    urls = re.findall(r'(?<=<a class="view" href=")[\d\/\w]+(?=">)', content, re.I|re.M)
    print str(len(titles)) + ':' + str(len(thumbs)) + ':' + str(len(urls))

    newarr = []
    if thumbs and titles and urls and len(thumbs) == len(titles) and len(thumbs) == len(urls):
        for i, d in enumerate(titles):
            try:
                print thumbs[i] + '---' + titles[i] + '----' + urls[i]
                newarr.append({'seq':int(urls[i].split('/')[2]), 'title':titles[i], 'thumb':thumbs[i], 'desc':titles[i], 'category_seq':'1', 'like':3, 'hate':0})
            except IndexError:
                pass
    # print newarr
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req,json.dumps(newarr))
    response = f.read()
    f.close()

def uprank_channel(content):
    # print content
    url = _server_+'/channel/uprank'
    thumbs = re.findall(r'(?<=<div class="thumb"><img src=")[\w\:\/\.\d]+', content, re.I|re.M)
    titles = re.findall(r'(?<=<p>)(\W+|[^\<]+)(?=</p>)', content, re.I|re.M)
    urls = re.findall(r'(?<=<a class="view" href=")[\d\/\w]+(?=">)', content, re.I|re.M)
    print str(len(titles)) + ':' + str(len(thumbs)) + ':' + str(len(urls))

    newarr = []
    if thumbs and titles and urls and len(thumbs) == len(titles) and len(thumbs) == len(urls):
        for i, d in enumerate(titles):
            try:
                print thumbs[i] + '---' + titles[i] + '----' + urls[i]
                newarr.append({'seq':int(urls[i].split('/')[2]), 'category_seq':'1', 'like':3, 'hate':0, 'rnktue':99, 'rnkmon':100, 'rnk10':99})
            except IndexError:
                pass
    # print newarr
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req,json.dumps(newarr))
    response = f.read()
    f.close()

def list_category():
    url = _server_+'/category/list'
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()
    print response
    f.close()

def rank_channel():
    url = _server_+'/channel/list' + '?rank=rnk20'
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()
    print response
    f.close()

def cate_channel():
    url = _server_+'/channel/cate' + '?category_seq=1'
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()
    print response
    f.close()

if __name__ == '__main__':
    # parse_category(get_data_from_url('http://m.podbbang.com/category'))
    # parse_channel(get_data_from_url('http://m.podbbang.com/category/lists/0/1'))
    # uprank_channel(get_data_from_url('http://m.podbbang.com/category/lists/0/1'))
    # list_category()
    # rank_channel()
    cate_channel()