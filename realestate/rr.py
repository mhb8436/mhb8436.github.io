from flask import Flask, request, render_template, jsonify
import os, sys, httplib, re, json, time, random
import sqlite3
from decimal import *
import simplejson

app = Flask(__name__)


conn = MySQLdb.connect(config.get('MYSQL', 'host'),config.get('MYSQL', 'user'),config.get('MYSQL', 'passwd'),config.get('MYSQL', 'db'))
conn.autocommit(True)

class DecimalEncoder(json.JSONEncoder):
  def _iterencode(self, o, markers=None):
    if isinstance(o, decimal.Decimal):
      # wanted a simple yield str(o) in the next line,
      # but that would mean a yield on the line with super(...),
      # which wouldn't work (see my comment below), so...
      return (str(o) for o in [o])
    return super(DecimalEncoder, self)._iterencode(o, markers)

@app.route('/')
def document_root():
  return render_template('index.html', yourip=request.remote_addr)

@app.route('/wifi')
def document_main():
  return render_template('wifi.html', yourip=request.remote_addr)


@app.route('/api/get/myjob')
def get_myjob_for_wifi():
    cur = redshift.cursor()
    cur.execute(""" select c.lat, c.lng from ktwfloc c left join ktwfloc_addr2 d on c.lat = d.lat and c.lng = d.lng  where d.lat is null limit 10 """ )
    rows = cur.fetchall()
    a = []
    for row in rows:
        print row
        a.append({'lat':str(row[0]), 'lng':str(row[1])})
    cur.close()
    return json.dumps(a,cls=DecimalEncoder)


@app.route('/api/put/myjob', methods=['POST','OPTIONS'])
def put_myjob_for_wifi():
    result = json.loads(request.data)
    log.debug( 'put_myjob input data length is ' + str(len(result)))
    fid = []
    cur = redshift.cursor()

    for r in result:
        print r['address']['status']
        if r['address']['status'] == 'OK':
            fid.append({'addr': r['address']['results'][0]['formatted_address'], 'lat':float(r['latlng'].split(',')[0]), 'lng':float(r['latlng'].split(',')[1])})

    cur.executemany("""INSERT INTO ktwfloc_addr(addr,lat,lng) VALUES (%(addr)s, %(lat)s, %(lng)s)""", tuple(fid))
    redshift.commit()    
    
    log.debug( 'put_myjob update result is ' + str(len(fid)))

    return jsonify(msg="Thanks for your contribution")



if __name__ == '__main__':
    log.debug('server started...')
    app.debug = True
    app.run(host='0.0.0.0',port=5000, debug=True)
