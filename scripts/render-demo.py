"""Render a captioned demo from real browser captures and generated narration.
Run after producing outputs/demo/edit-timeline.json and capture manifests.
No API credentials are stored in this script.
"""
import json, math, subprocess, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs/demo';OUT.mkdir(parents=True,exist_ok=True)
W,H=1920,1080
BG='#080d16';INK='#101a27';TEXT='#edf1f8';MUTED='#b5c1d1';GOLD='#ffc75f';GREEN='#52ddb3'
fontdir=Path('/System/Library/Fonts/Supplemental')
def font(n,bold=False,serif=False):return ImageFont.truetype(str(fontdir/('Georgia.ttf' if serif else 'Arial Bold.ttf' if bold else 'Arial.ttf')),n)
def txt(d,xy,text,size=34,fill=TEXT,bold=False,serif=False): d.text(xy,text,font=font(size,bold,serif),fill=fill)
def wrap(d,text,maxw,size,bold=False):
 lines=[];line=''
 for word in text.split():
  candidate=(line+' '+word).strip()
  if d.textlength(candidate,font=font(size,bold))>maxw and line:lines.append(line);line=word
  else:line=candidate
 if line:lines.append(line)
 return lines
def base(chapter,number=None):
 im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
 d.line((76,105,1844,105),fill='#293748',width=2)
 txt(d,(78,35),'Raksha',42,GOLD,serif=True)
 txt(d,(1330,47),'YC FALL 2026 x MOSS',25,MUTED,bold=True)
 txt(d,(80,140),chapter,30,GREEN,bold=True)
 if number:txt(d,(1770,138),number,26,MUTED)
 return im

def title():
 im=base('A MOMENT TO PAUSE');d=ImageDraw.Draw(im)
 txt(d,(90,260),'Before the OTP.',100,serif=True)
 txt(d,(90,385),'Before the transfer.',100,GOLD,serif=True)
 txt(d,(96,560),'A second listener for scam calls.',43,MUTED)
 d.rounded_rectangle((96,670,1090,770),24,fill='#193029',outline=GREEN,width=2)
 txt(d,(126,698),'Recognise the pressure. Bring someone you trust.',33,GREEN)
 txt(d,(97,830),'raksha-app.web.app',35,TEXT,bold=True)
 txt(d,(1230,830),'AI-generated narration',24,MUTED)
 im.save(OUT/'opening.png')
 thumb=im.resize((1280,720));thumb.save(ROOT/'docs/submission/assets/thumbnail.png')
def architecture():
 im=base('HOW MOSS MAKES THE WARNING POSSIBLE');d=ImageDraw.Draw(im)
 nodes=[(90,300,480,535,'01  LISTEN','Spoken fragment','Browser speech or','uploaded recording'),(640,300,1160,535,'02  RETRIEVE','Moss in-process','Playbook + call memory','No vector DB round trip'),(1320,300,1820,535,'03  INTERVENE','Risk engine','Evidence + exact words','Live guardian context')]
 for x,y,x2,y2,k,h,a,b in nodes:
  d.rounded_rectangle((x,y,x2,y2),24,fill=INK,outline=GREEN if 'MOSS' in h.upper() else '#35465c',width=2)
  txt(d,(x+26,y+25),k,24,GREEN,bold=True);txt(d,(x+26,y+75),h,39,GOLD,serif=True)
  txt(d,(x+26,y+143),a,27,MUTED);txt(d,(x+26,y+182),b,27,MUTED)
 for a,b in [(500,620),(1180,1300)]:
  d.line((a,420,b,420),fill=GREEN,width=5);d.polygon([(b,420),(b-14,410),(b-14,430)],fill=GREEN)
 d.rounded_rectangle((640,620,1160,770),24,fill=INK,outline='#35465c',width=2)
 d.line((900,540,900,615),fill=GOLD,width=3)
 txt(d,(668,645),'LLM coach, separately',36,GOLD,serif=True)
 txt(d,(668,702),'Explanation outside the fast path',27,MUTED)
 txt(d,(100,843),'Firebase Hosting + Cloud Run  |  One bounded demo instance',30,MUTED)
 im.save(OUT/'architecture.png');im.save(ROOT/'docs/submission/assets/architecture.png')
def closing():
 im=base('GIVE SOMEONE A CHANCE TO HANG UP');d=ImageDraw.Draw(im)
 txt(d,(90,260),'A second listener.',95,serif=True);txt(d,(90,375),'A person you trust.',95,GOLD,serif=True)
 for x,num,label in [(96,'10 / 10','Scripted scams detected'),(710,'0 / 8','Genuine calls at danger'),(1325,'409','Playbook entries')]:
  txt(d,(x,590),num,80,GREEN,serif=True);txt(d,(x,695),label,29,MUTED)
 txt(d,(98,790),'Fixture results, not real-world accuracy guarantees.',28,MUTED)
 txt(d,(98,855),'Try it: raksha-app.web.app',37,TEXT,bold=True)
 im.save(OUT/'closing.png')

title();architecture();closing()
if '--assets-only' in __import__('sys').argv: raise SystemExit(0)
timeline=json.loads((OUT/'edit-timeline.json').read_text())
labels={'shield':'01  START A CALL','danger':'02  RECOGNISE THE SCRIPT','guardian':'03  BRING SOMEONE YOU TRUST','benign':'04  CHECK THE GENUINE CASE','playbook':'05  INSPECT THE EVIDENCE','lab':'06  MEASURE THE RUNNING APP'}
# Use captured frame sequences where present, otherwise a verified screenshot.
captures={}
for scene in labels:
 manifest=OUT/f'{scene}-frames.json'
 if manifest.exists():captures[scene]=json.loads(manifest.read_text())

scene_durations={scene:sum(r['duration']+.12 for r in timeline if r['scene']==scene) for scene in labels}
scene_offsets={scene:0 for scene in labels}
segments=[];srt=[];offset=0;captionIndex=0
for idx,row in enumerate(timeline):
 scene=row['scene'];duration=row['duration']+.12
 # Short cues remain readable, even on a phone.
 words=row['text'].split();chunks=[]
 for start in range(0,len(words),11):chunks.append(' '.join(words[start:start+11]))
 bounds=[0]
 for chunk in chunks:bounds.append(bounds[-1]+duration*len(chunk.split())/len(words))
 for j,chunk in enumerate(chunks):
  captionIndex+=1
  def stamp(s):
   ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
  srt.append(f'{captionIndex}\n{stamp(offset+bounds[j])} --> {stamp(offset+bounds[j+1])}\n{chunk}\n')
 # Compose at 8fps from real captures, then encode at 24fps.
 fps=8;count=math.ceil(duration*fps);paths=[]
 for n in range(count):
  t=min(duration,n/fps)
  if scene in ['opening','architecture','closing']:im=Image.open(OUT/f'{scene}.png').convert('RGB')
  else:
   im=base(labels[scene]);d=ImageDraw.Draw(im)
   txt(d,(1220,142),'DEMO: OFFLINE DETECTOR',26,GOLD,bold=True)
   if scene in captures:
    seq=captures[scene]
    progress=(scene_offsets[scene]+t)/scene_durations[scene]
    if len(seq)>1 and 't' in seq[0]:
     target=seq[0]['t']+progress*(seq[-1]['t']-seq[0]['t'])
     chosen=next((x['file'] for x in seq if x['t']>=target),seq[-1]['file'])
    else:chosen=seq[min(len(seq)-1,int(progress*len(seq)))]['file']
   else:chosen=str(OUT/f'{scene}.png')
   shot=Image.open(chosen).convert('RGB');shot.thumbnail((1770,720),Image.Resampling.LANCZOS)
   x=(W-shot.width)//2;y=198+(720-shot.height)//2
   im.paste(shot,(x,y));d.rounded_rectangle((x-1,y-1,x+shot.width,y+shot.height),10,outline='#334458',width=2)
  d=ImageDraw.Draw(im);d.rectangle((0,939,W,H),fill='#04070d')
  cue=next((chunks[j] for j in range(len(chunks)) if bounds[j]<=t<bounds[j+1]),chunks[-1])
  lines=wrap(d,cue,1700,39)
  y=963 if len(lines)>1 else 985
  for line in lines:
   width=d.textlength(line,font=font(39));txt(d,((W-width)/2,y),line,39);y+=49
  d.rectangle((0,1074,int(W*(offset+t)/sum(r['duration']+.12 for r in timeline)),1080),fill=GOLD)
  path=OUT/f'render-{idx:02d}-{n:04d}.jpg';im.save(path,quality=91);paths.append(path)
 seg=OUT/f'segment-{idx:02d}.mp4'
 subprocess.run(['ffmpeg','-v','error','-y','-framerate',str(fps),'-i',str(OUT/f'render-{idx:02d}-%04d.jpg'),'-i',row['file'],'-af','apad=pad_dur=0.12','-t',str(duration),'-r','24','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(seg)],check=True)
 segments.append(seg);offset+=duration
 if scene in scene_offsets:scene_offsets[scene]+=duration
 for path in paths:path.unlink()
 print(f'Rendered {scene}: {duration:.1f}s',flush=True)
(OUT/'captions.srt').write_text('\n'.join(srt))
(OUT/'concat.txt').write_text(''.join(f"file '{p}'\n" for p in segments))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(OUT/'concat.txt'),'-i',str(OUT/'captions.srt'),'-map','0:v','-map','0:a','-map','1:0','-c:v','copy','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-c:a','aac','-b:a','192k','-c:s','mov_text','-metadata:s:s:0','language=eng','-movflags','+faststart',str(OUT/'Raksha-Demo.mp4')],check=True)
print(f'Final video {offset:.1f}s: {OUT}/Raksha-Demo.mp4')
