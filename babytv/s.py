#-*- coding: utf-8 -*-
from urllib import urlencode
import simplejson as json
import csv
import sys
import re
import urllib
import urllib2
# import simplejson as json
import json
import gzip
from StringIO import StringIO
import base64
import codecs

# _server_ = 'http://localhost:8080'
_server_ = 'http://xcv1173.appspot.com/'

def parseyoutube(url, keywords):
	opener = urllib2.build_opener(urllib2.HTTPCookieProcessor())
	urllib2.install_opener(opener)
	opener.addheaders = [
		 ('accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
		,('accept-encoding','gzip,deflate,sdch')
		,('accept-language','en-US,en;q=0.8,ko;q=0.6')
		,('user-agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36')
	]
	google_res = opener.open(url)
	# print google_res.info().get('Content-Encoding')
	if google_res.info().get('Content-Encoding') == 'gzip':
		buf = StringIO( google_res.read() )
		f = gzip.GzipFile(fileobj=buf)
		content = f.read()
		# print content
		# dataus = re.findall(r'<a class="en[a-zA-Z0-9\_\s]*" data-u="[a-zA-Z0-9\=]*"', content, re.M|re.I)
		images = re.findall(r'="//i.ytimg.com[\/\s\-\d\w\.]*mqdefault.jpg"',content, re.I|re.M)
		dataus = re.findall(r'yt-uix-sessionlink yt-uix-tile-link  spf-link  yt-ui-ellipsis yt-ui-ellipsis-2(.*)', content, re.M|re.I)
		
		result = []	
		# print str(len(dataus)) + ':' + str(len(images))
		# print dataus
		# print images
		if dataus and images:
			for i, d in enumerate(dataus):
				
				try:
					playlists = re.search(r'href="/(.*)"', d, re.M|re.I)
					# playlists.group().replace('href="','').replace('"','')
					# print playlists
					name = re.search(r'title="(.*)"(\s)+data', d, re.M|re.I)
					# name.group().replace('title=','').replace('data','').strip()
					image = re.search(r'="(.*).jpg"', images[i], re.M|re.I) 
					# image.group().replace('="','').replace('width','').strip()
					if playlists:
						ppp = playlists.group().replace('href="','').replace('"','')
						print ppp
						if '?list=' in ppp:
							ppp = ppp.split('?list=')[1]
						elif '&amp;list=' in ppp:
							ppp = ppp.split('&amp;list=')[1]
						# print len(keywords)
						if len(keywords) > 0:
							chk = False
							for k in keywords:
								if k in name.group(): 
									chk = True
							# print str(chk)		
							if chk:	
								result.append({'url':ppp , 'name':name.group().replace('title=','').replace('data','').replace('"','').replace('"','').strip(), 'image':image.group().replace('="','').replace('width','').replace('"','').strip()  })
						else:
							result.append({'url':ppp , 'name':name.group().replace('title=','').replace('data','').replace('"','').replace('"','').strip(), 'image':image.group().replace('="','').replace('width','').replace('"','').strip()  })
				except IndexError as e:
					print 'error'
					print e
					pass

		return result

def readyoutube():
	urls = [
		['http://www.youtube.com/user/Tayo/playlists?sort=dd&shelf_id=2&view=50',['타요','Tayo']],
		# ['http://www.youtube.com/channel/UCP4EcL_nnTYo1WB5GpVZk5w/playlists',[]],
		# ['http://www.youtube.com/user/PororoTV/playlists?flow=list&sort=dd&view=1',['뽀로로','Pororo']],
		['http://www.youtube.com/user/Tayo/playlists?shelf_id=2&sort=dd&view=50',['타요','Tayo']]
		# ['http://www.youtube.com/user/roivisual/playlists?view=1&sort=dd',['폴리','우비']],
		# ['http://www.youtube.com/user/LarvaKoreaCartoon/playlists',['라바']],
		# ['http://www.youtube.com/user/LarvaMondo777',['쥬쥬']],
		# ['http://www.youtube.com/user/1Cocomong/playlists',['Cocomong','코코몽']],
		# ['http://www.youtube.com/user/albahm05/playlists', ['공룡기차']],
		# ['http://www.youtube.com/user/jsmouse89',['바다탐험대']],
		# ['http://www.youtube.com/channel/UCP4EcL_nnTYo1WB5GpVZk5w/playlists',[]],

		# ['http://www.youtube.com/user/CartoonsAIO/playlists',['구름빵','호비','프랭키']],
		# ['http://www.youtube.com/channel/UCK11RxSZp2JMHfBBuEeqfeg/playlists',['옥토넛','Octonauts']],
		# ['http://www.youtube.com/user/Digimmon2014/playlists',['쥬쥬']],
		# ['http://www.youtube.com/user/TOBOTYOUNGTOYS/playlists',['TOBOT']],
		# ['http://www.youtube.com/user/oconkorea/playlists?view=1&sort=dd',['디보']]
	]
	for url in urls:
		# print url
		rr = parseyoutube(url[0], url[1])
		# print rr
		for r in rr:
			url = _server_+'/yiowijk123?i=' + urllib.quote(r['image']) + '&p=' +  urllib.quote(r['url']) + '&t=' +  urllib.quote(r['name']) 
			# result2 = urllib2.urlopen(url)
			print r			

if __name__ == '__main__':
	# rr = parseyoutube('http://www.youtube.com/user/PororoTV/playlists?flow=list&sort=dd&view=1', ['뽀로로','타요'])
	# print rr
	readyoutube()

	# for r in rr:
	# 	url = _server_+'/yiowijk123?i=' + urllib.quote(r['image']) + '&p=' +  urllib.quote(r['url']) + '&t=' +  urllib.quote(r['name']) 
	# 	print r
	# 	result2 = urllib2.urlopen(url)

	# print 'makememcache begin'
	# # url = 'http://xcv1173.appspot.com/ewdfosid71'
	# url = _server_ + '/yiowijlk09'
	# # result = urlfetch.fetch(url)
	# result = urllib2.urlopen(url)
	# lll = json.loads(result.read())

	# print lll
	print 'Finished..'	


