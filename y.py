# -*- coding: utf-8 -*-

import csv
import sys
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import sqlite3
import datetime


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
		print res.info().get('Content-Encoding')
		if res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( res.read() )
			f = gzip.GzipFile(fileobj=buf)
			data = f.readlines()
			return data
	except:
		pass

def parse(data):

	for line in data:
		# print line
		if 'data-video-id' in line and 'data-video-title' in line:
			print line

if __name__ == '__main__':
	url = "http://www.youtube.com/watch?v=tdLeW41jdBo&list=PLawdY97HdndRyqbW3Qbhh1scfE1JCPnCf"
	data=get_data_from_url(url)
	parse(data)
