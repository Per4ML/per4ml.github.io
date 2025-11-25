#! /usr/bin/env python3

import os

def fillhtml(basename, contents):
  with open(f'{basename}.html.in', 'r') as infile, \
        open(f'{basename}.html', 'w') as outfile:
    for line in infile.readlines():
      outfile.write(line)
      if 'class="pagecontent"' in line:
        outfile.write('\n'.join(contents)+'\n')

def parsemembers(contents):
  lines = []
  member = {}
  lines = ['<div class="imgwrap">', '<div class="imggrid">']
  img = lambda url, name: '  <div class="imgitem">\n' + \
                          '    <figure>\n' + \
                          f'      <img src="{url}" alt="{name}">\n' + \
                          f'      <figcaption>{name}</figcaption>\n' + \
                          '    </figure\n' + \
                          '  </div>'
  for line in contents:
    if line == '':
      if 'name' in member:
        if 'img' in member:
          line = img(member['img'], member['name'])
        else:
          line = f'<h3>{member["name"]}</h3>'
        lines.append(line)
      member = {}
    else:
      fields = line.split('=')
      if len(fields) == 2:
        print(fields[0],'=',fields[1])
        member[fields[0]] = fields[1]
  if 'name' in member:
    if 'img' in member:
      line = img(member['img'], member['name'])
    else:
      line = f'<h3>{member["name"]}</h3>'
    lines.append(line)
  lines.append('</div>\n</div>')
  return lines

def parsenews(contents):
  lines = ['<ul style="list-style-type:circle; style="margin-bottom:80px;">']
  level = 0
  for line in contents:
    if line == '':
      if level > 1:
        lines.append('    </ul>')
      lines.append('  </li>')
      level = 0
    elif level == 0:
      lines.append('  <li style="margin-top:20px;">')
      lines.append('  ' + line)
      level = 1
    elif level == 1:
      lines.append('    <ul style="list-style-type:none; margin-bottom:20px;">')
      lines.append(f'      <li>{line}</li>')
      level = 2
    else:
      lines.append(f'      <li>{line}</li>')
  if level > 0:
    lines.append('    </ul>')
    lines.append('  </li>')
  lines.append('</ul>')
  return lines

def parsepubs(contents):
  lines = ['<dl style="margin-bottom:80px;">']
  indt = False
  for line in contents:
    if line == '':
      indt = False
    elif not indt:
      lines.append('<dt>' + line + '</dt>')
      indt = True
    else:
      lines.append('<dd>' + line + '</dd>')
  lines.append('</dl>')
  return lines

def processcontent(basename, contents):
  if not contents:
    pass
  elif basename == 'pubs':
    contents = parsepubs(contents)
  elif basename == 'news':
    contents = parsenews(contents)
  elif basename == 'members':
    contents = parsemembers(contents)
  contents += \
    ['<figure>',
    '<img src="images/per4ml.png" alt="Per4ML" class="stretch-figure">',
    '</figure>']
  fillhtml(basename, contents)

if __name__ == '__main__':
  for basename in os.listdir():
    if not basename.endswith('.html.in'):
      continue
    basename = basename[:-8]
    infile = os.path.join('contents', basename)
    contents = []
    if os.path.isfile(infile):
      with open(infile, 'r') as infile:
        contents = [line.rstrip() for line in infile.readlines()]
    processcontent(basename, contents)

