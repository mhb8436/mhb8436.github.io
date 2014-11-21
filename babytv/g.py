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




if __name__ == '__main__':
	# rr = parseyoutube('http://www.youtube.com/user/PororoTV/playlists?flow=list&sort=dd&view=1', ['뽀로로','타요'])
	# print rr
	url = 'http://www.youtube.com/watch?v=tdLeW41jdBo&list=PLawdY97HdndRyqbW3Qbhh1scfE1JCPnCf'
	req = urllib2.Request(url)
	response = urllib2.urlopen(req)

	for i, line in enumerate(response.readlines()):
		if 'data-video-id' in line:
			print line