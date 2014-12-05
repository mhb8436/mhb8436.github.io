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

def parse_channel(content):
    print content
    thumbs = re.findall(r'(?<=<div class="thumb"><img src=")[\w\:\/\.\d]+', content, re.I|re.M)
    titles = re.findall(r'(?<=<p>)(\W+|[^\<]+)(?=</p>)', content, re.I|re.M)
    urls = re.findall(r'(?<=<a class="view" href=")[\d\/\w]+(?=">)', content, re.I|re.M)
    print str(len(titles))
    print str(len(thumbs))
    print str(len(urls))
    if thumbs and titles and urls and len(thumbs) == len(titles) and len(thumbs) == len(urls):
        for i, d in enumerate(titles):
            try:
                print thumbs[i] + '---' + titles[i] + '----' + urls[i]
            except IndexError:
                pass

    # dataus = re.findall(r'<div class="[a-zA-Z0-9\_\s\-]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
    # for i, d in enumerate(dataus):


if __name__ == '__main__':
    parse_channel(get_data_from_url('http://m.podbbang.com/category/lists/0/1'))
