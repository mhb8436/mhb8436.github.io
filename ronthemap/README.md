#README.md

1. 평당 가격
select state||' '||mainno||' '||subno||' '||apt, sum(tamount)/sum(area/3.3) from real_estate_apt_buy where cym='201503' group by state||' '||mainno||' '||subno||' '||apt limit 10;

2. 거래량(기울기)
select apt, regr_slope(COALESCE(cnt,0), extract(EPOCH from d.ymd::date)) as slope 
from 
(select distinct state||' '||mainno||' '||subno||' '||apt, state, mainno,subno,apt 
from real_estate_apt_buy o, copy_ymd d where d.ymd like '2014%' and apt like '%포레스타1단지%') d left join (
select state||' '||mainno||' '||subno||' '||apt as apt, cym||'01' as cym, count(1) as cnt 
from real_estate_apt_buy where cym like '2014%'  
and apt like '%포레스타1단지%'
group by state||' '||mainno||' '||subno||' '||apt, cym order by 1,2
) o on d.ymd=cym||'01' and d.ymd like '2014%'
group by apt order by slope desc
;


select  ttt, state, mainno, subno, apt, ymd
from copy_ymd d left join (select distinct state||' '||mainno||' '||subno||' '||apt as ttt, state, mainno,subno,apt  from real_estate_apt_buy ) o on o.apt like '%포레스타1단지%'
where d.ymd like '2014%' 


3. 거래량(년별, 기간별) - top 100 등 지역별 
select state||' '||mainno||' '||subno||' '||apt as apt, count(1) as cnt 
from real_estate_apt_buy where cym like '2014%' 
group by state||' '||mainno||' '||subno||' '||apt order by 2 desc


4. copy_ymd 
select '20140101'::date + interval '1 month';

create table copy_ymd as
select to_char('20010101'::date + interval '1 month'*rn,'YYYYMMDD') as ymd from (
select row_number() over() as rn from real_estate_apt_buy limit 1000
) a;

select '20140101'::date + interval '1 month' * rn from ( select  row_number() over() as rn
from real_estate_apt_buy limit 10 ) a ;








