import json, sys
sizes=json.load(open("sizes.json")) if __import__("os").path.exists("sizes.json") else None
pages=json.load(open("pages.json"))
if sizes is None:
    N=507; F=7; b=N//F; e=N%F; sizes=[b+(1 if i<e else 0) for i in range(F)]
tot=sum(pages); F=len(sizes); target=tot/F
dens=[s/p for s,p in zip(sizes,pages)]          # problems per page
new=[round(s+(target-p)*d) for s,p,d in zip(sizes,pages,dens)]
diff=sum(new)-sum(sizes)
i=0
while diff!=0:                                   # 修正总数
    k=i%F
    if diff>0 and new[k]>1: new[k]-=1; diff-=1
    elif diff<0: new[k]+=1; diff+=1
    i+=1
json.dump(new, open("sizes.json","w"))
print("old",sizes,"pages",pages,"-> new",new,sum(new))
