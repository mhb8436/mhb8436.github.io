#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
import simplejson
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

# _server_ = 'http://127.0.0.1:9080'
_server_ = 'http://inspired-muse-794.appspot.com/'

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

def parse_channel(category_seq, content):
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
                # print thumbs[i] + '---' + titles[i] + '----' + urls[i]
                # if int(urls[i].split('/')[2]) == 7064:
                    # episodes = get_episode(category_seq, int(urls[i].split('/')[2]))
                newarr.append({'seq':int(urls[i].split('/')[2]), 'title':titles[i], 'thumb':thumbs[i], 'desc':titles[i], 'category_seq':str(category_seq), 'like':3, 'hate':0})
            except IndexError:
                pass
    print newarr
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req,json.dumps(newarr))
    response = f.read()
    f.close()

def parse_epi_url(url):
    content = get_data_from_url('http://m.podbbang.com'+url);
    # print content
    url = re.findall(r'<div class="btn-play"><a href="[\.\w\d\/\:]*"><span>', content, re.M|re.I)
    for u in url:
        # print u
        return u.replace('<div class="btn-play"><a href="','').replace('"><span>','')

def parse_episode(category_seq, channel_seq, content):
    # print content
    if content is None or len(content) < 10:
        return
    surl = _server_+'/episode/add'
    seq = re.findall(r'<dd>&nbsp;(.+).</dd>', content, re.M|re.I)
    title = re.findall(r'<dd class="tit">(.+)</dd>', content, re.M|re.I)
    url = re.findall(r'<a class="view" href="(.+)">', content, re.M|re.I)
    date = re.findall(r'<dd class="date">(.+)</dd>', content, re.M|re.I)

    newarr = []
    for s,t,u,d in zip(seq, title, url, date):
        try:
            # print s + '-' + t + '-' + u + '-' + d
            newarr.append({'category_seq':category_seq,'channel_seq':channel_seq, 'seq':int(s), 'title':t, 'url':parse_epi_url(u),'duration':0,'type':'a', 'date':d, 'like':1, 'hate':1})
        except IndexError:
            pass
    print str(category_seq) + ' ' + str(channel_seq) + ' ' +str(len(newarr))
    req = urllib2.Request(surl)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req,json.dumps({'channel_seq':channel_seq, 'category_seq':category_seq, 'data':newarr}))
    response = f.read()
    f.close()
    # return json.dumps({'channel_seq':4362, 'category_seq':1, 'data':newarr})
    # return newarr

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
    print str(len(newarr))
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
    # print response
    f.close()
    return response

def rank_channel():
    url = _server_+'/channel/rank' + '?rank=rnk20'
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()    
    f.close()
    return response

def list_channel(category_seq):
    url = _server_+'/channel/list' + '?category_seq='+str(category_seq)
    print url
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()
    # print response
    f.close()
    return response

def parse_episode_with_channel(category_seq, channel_seq):
    print 'get_episode... start ' + str(channel_seq)
    nnn = []
    for n in range(1,100):
        sss = get_data_from_url('http://m.podbbang.com/ch/lists/%d/%d'%(channel_seq, n))
        if len(sss) > 38:
            parse_episode(category_seq, channel_seq, sss)
        else:
            break
    print 'get_episode ened ' +  str(channel_seq)
    return 

def get_episode(channel_seq):
    url = _server_+'/episode/list' + '?channel_seq=' + str(channel_seq)
    req = urllib2.Request(url)
    req.add_header('Content-Type', 'application/json')
    f = urllib2.urlopen(req)
    response = f.read()
    # print response
    f.close()
    return response

def makechannel():
    cates = list_category()
    print cates
    for cate in json.loads(cates):
        print cate['seq'] 
        for i in range(1, 20):
            parse_channel(cate['seq'], get_data_from_url('http://m.podbbang.com/category/lists/'+str(i)+'/' + str(cate['seq']) ))

def makeepisode(category_seq):
    chs = list_channel(category_seq)
    print str(len(chs))
    for ch in json.loads(chs):
        print 'category_seq is %s and channel_seq is %s' %(ch['category_seq'], ch['seq'])    
        bb = get_episode( ch['seq'])
        print len(bb)

        if bb is None or len(bb) <= 50:
            print 'bb is None'
            parse_episode_with_channel(ch['category_seq'], ch['seq'])
            print 'bb is None parse_episode_with_channel ended....'
        else:
            print 'bb is not None'
            b = []
            try:
                b = simplejson.loads(bb)
            except simplejson.scanner.JSONDecodeError:
                print bb
            if len(b) == 0:
                parse_episode_with_channel(ch['category_seq'], ch['seq'])
                print 'bb is not None parse_episode_with_channel ended....'

if __name__ == '__main__':
    # parse_category(get_data_from_url('http://m.podbbang.com/category'))
    # parse_channel(1, get_data_from_url('http://m.podbbang.com/category/lists/0/1'))
    # parse_episode(get_data_from_url('http://m.podbbang.com/ch/lists/4362/1'))
    # uprank_channel(get_data_from_url('http://m.podbbang.com/category/lists/0/1'))
    # print rank_channel()
    ###############
    # for i in range(1,16):
    #     aa=list_channel(i)
    #     # print aa
    #     for a in json.loads(aa):
    #         bb = get_episode(a['seq'])
    #         b = json.loads(bb)
    #         print str(a['category_seq']) + '   ' + str(a['seq']) + '    ' + str(a['name'].encode('utf8')) + '  ' + str(len(b))
    
    #################

    # parse_episode_with_channel(2, 6694)
    # get_episode(7021)
    # print parse_epi_url('/ch/episode/4362?e=21180210')
    # makechannel()
    # for i in range(7,9):
    #     makeepisode(i)
    makeepisode(11)
    # print list_category()


