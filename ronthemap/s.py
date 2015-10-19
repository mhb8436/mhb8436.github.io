# -*- coding: utf-8 -*-

import csv
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
import re
import urllib
import urllib2
import httplib

# import simplejson as json
import codecs, json
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
		print url
		res = opener.open(url)
		print res.info().get('Content-Encoding')
		if res.info().get('Content-Encoding') == 'gzip':
			buf = StringIO( res.read() )
			f = gzip.GzipFile(fileobj=buf)
			data = f.readlines()
			return data
	except:
		pass

def getaddr(name):
	uri = '/maps/api/place/textsearch/json?key=AIzaSyAf0r-fdF5gfhOJ96ppu_289IuEn9RPe7A&language=ko&query='
	c = httplib.HTTPSConnection('maps.googleapis.com')
	c.request('GET',uri+urllib2.quote(name))
	res = c.getresponse()
	print res.status, res.reason
	data = json.loads(res.read())
	return (data['results'][0]['formatted_address'].encode('utf-8'),  data['results'][0]['geometry']['location']['lat'], data['results'][0]['geometry']['location']['lng'])

def main100():		
	rrr = []
	with open('100.txt') as f:
		content = f.readlines()
		for c in content:
			aa = c.split('/')
			try:
				# print aa[0].strip() + ' ' + aa[1].strip()
				nnm = getaddr(aa[0].strip() + ' ' + aa[1].strip())
				rrr.append({'name':aa[0].strip(), 'addr1':aa[1].strip(), 'birth':aa[2].strip(), 'menu':aa[3].strip(), 'addr2':nnm[0], 'lat':nnm[1], 'lng': nnm[2]})
			except:
				print aa
	with codecs.open('100s.txt', 'w', encoding='utf-8') as f:
		json.dump(rrr, f, indent=4, sort_keys=True, ensure_ascii=False)


def main358():
	rrr = []
	with open('358.txt') as f:
		content = f.readlines()
		for c in content:
			aa = c.split('/')
			try:
				# print aa[0].strip() + ' ' + aa[1].strip()
				nnm = getaddr(aa[0].strip() + ' ' + aa[3].strip())
				rrr.append({'name':aa[0].strip(), 'addr1':aa[3].strip(), 'tel':aa[1].strip(), 'menu':aa[2].strip(), 'addr2':nnm[0], 'lat':nnm[1], 'lng': nnm[2]})
			except:
				print aa
	with codecs.open('358s.txt', 'w', encoding='utf-8') as f:
		json.dump(rrr, f, indent=4, sort_keys=True, ensure_ascii=False)
					
if __name__ == '__main__':
	# getaddr()
	# main100()
	main358()