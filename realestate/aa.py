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
import xlrd



if __name__ == '__main__':
	url = "http://rt.molit.go.kr/rtFile.do?cmd=fileDownload"
	for i in range(210,211):
		try:
			values = {'seq_no':i, 'file_seq_no':1}
			data = urllib.urlencode(values)

			remotefile = urllib2.urlopen(url, data)
			fname = remotefile.info()['Content-Disposition']
			# print fname
			m = re.search(r'(\d\d\d\d\d\d)', fname)
			mm = m.group()
			mm = mm.replace('"','')
			print mm
			urllib.urlretrieve(url, mm+'_APT_'+str(i)+'.xls', {}, data)
		except:
			print 'error' + str(i)
			pass
