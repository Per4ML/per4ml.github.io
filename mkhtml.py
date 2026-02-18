#! /usr/bin/env python3

import json, os, re
from errno import ENOENT

class PubParser:
  # the key shouldn't have / or . but some have it
  starts = re.compile(r'^@[a-zA-Z]+\s*{\s*[a-zA-Z0-9_:/\.-]+\s*,',
                      flags=re.MULTILINE)
  field = re.compile(r'^\s*([a-zA-Z]+)\s*=\s*(.*)')
  domain = re.compile(r'http[s]?://(?:www\.)?([^/]+)')
  delims = { '{': '}', '\"': '\"' }
  # map for special chars used
  # all have braces and start with \
  # escape periods for re
  # '{\dj}' = 'đ'
  charmap = sorted(
            (
            ('dj', 'đ'),
            ('\'c', 'ć'),
            ('`o', 'ò'),
            ('\'o', 'ó'),
            ('^o', 'ô'),
            ('\"o', 'ö'),
            ('Ho', 'ő'),
            ('~o', 'õ'),
            ('cc', 'ç'),
            ('ka', 'ą'),
            ('l', 'ł'),
            ('=o', 'ō'),
            ('bo', 'o'),
            (r'\.o', 'ȯ'),
            ('du', 'ụ'),
            ('ra', 'å'),
            ('uo', 'ŏ'),
            ('vs', 'š'),
            ('too', 'o͡o'),
            ('o', 'ø'),
            ('i', 'ı'),
            ))
  def __init__(self, contents):
    lines = [line for line in contents if not line.startswith('%')]
    lines = '\n'.join(lines)+'\n'
    lines = re.sub('\r','\n',lines)
    lines = re.sub('\n\n+','\n',lines)
    self.contents = lines

  @staticmethod
  def nextfield(bib):
    for row in bib.split('\n'):
      field = PubParser.field.findall(row)
      try:
        key, val = field[0][0], field[0][1]
      except IndexError:
        continue
      if val.endswith(','):
        val = val[:-1]
      if any([val.startswith(c) for c in PubParser.delims]):
        if not val.endswith(PubParser.delims[val[0]]):
          continue
        val = val[1:-1]
      elif ' ' in val:
        continue
      if not val:
        continue
      for chars in PubParser.charmap:
        val = re.sub('{\\\\'+chars[0]+'}', chars[1], val)
      yield key.lower(), val

  def nextbib(self):
    starts = PubParser.starts.findall(self.contents)
    for i in range(len(starts)):
      start = self.contents.index(starts[i])
      if start>0 and self.contents[start-1] != '\n':
        continue
      stop = self.contents.index(starts[i+1]) \
              if i+1 < len(starts) else len(self.contents)
      for i in range(start+1, stop):
        if self.contents[i] == '{':
          break
      for i in range(i+1, stop):
        if self.contents[i] not in (' ', '\t'):
          break
      bibkey = ''
      for i in range(i, stop):
        if self.contents[i] in (' ', '\t', ','):
          break
        bibkey += self.contents[i]
      bib = self.contents[start:stop].rstrip()
      fields = {}
      for key, val in PubParser.nextfield(bib):
        if key == 'note':
          if 'note' not in fields:
            fields['note'] = []
          fields[key].append(val)
        else:
          fields[key] = val
      if fields:
        fields['key'] = bibkey
        yield bib, fields

  def __iter__(self):
    self.bibs, self.fields = [], []
    for bib, field in self.nextbib():
      self.bibs.append(bib)
      self.fields.append(field)
    self.index = -1
    return self

  def __next__(self):
    self.index += 1
    if self.index == len(self.bibs):
      raise StopIteration
    return self.bibs[self.index], self.fields[self.index]

class HTMLTemplate:
  def __init__(self, blank='contents/blank.html'):
    if not os.path.isfile(blank):
      raise FileNotFoundError(f'[Errno {ENOENT}]' + \
                              f' No such file or directory: \'{blank}\'')
    with open(blank, 'r') as infile:
      self.blank = infile.read()
    self.keys = ['MORESTYLES', 'PAGECONTENT']

  def fill(self, keyvals, html=''):
    if not html:
      html = self.blank
    for key in self.keys:
      if key not in html:
        continue
      pre = html[:html.index(key)]
      post = html[html.index(key)+len(key):]
      html = pre
      if key in keyvals:
        html += keyvals[key]
      html += post
    return html

  def processcontent(self, basename, contents):
    self.styles = []
    if not contents:
      pass
    elif basename == 'pubs':
      contents = self.parsepubs(contents)
    elif basename == 'news':
      contents = self.parsenews(contents)
    elif basename == 'members':
      contents = self.parsemembers(contents)
    contents += \
      ['<figure>',
      '<img src="images/per4ml.png" alt="Per4ML" class="stretch-figure">',
      '</figure>']
    html = self.fill({
                      'MORESTYLES': '\n'.join(self.styles),
                      'PAGECONTENT': '\n'.join(contents),
                      })
    return html

  def parsemembers(self, contents):
    contents = re.sub('^//.*$', '', '\n'.join(contents), flags=re.MULTILINE)
    lines = ['<div class="imgwrap">', '<div class="imggrid">']
    img = lambda url, name: '  <div class="imgitem">\n' + \
                            '    <figure>\n' + \
                            f'      <img src="{url}" alt="{name}">\n' + \
                            f'      <figcaption>{name}</figcaption>\n' + \
                            '    </figure>\n' + \
                            '  </div>'
    imglink = lambda img, name, url='':  \
              '  <div class="imgitem">\n' + \
              f'    <a href=\"{url}\">' + \
              '    <figure>\n' + \
              f'      <img src="{img}" alt="{name}">\n' + \
              f'      <figcaption>{name}</figcaption>\n' + \
              '    </figure>\n' + \
              '    </a>' + \
              '  </div>'
    for member in json.loads(contents):
      if 'name' in member and 'img' in member:
        if 'url' in member:
          lines.append(imglink(member['img'], member['name'], member['url']))
        else:
          lines.append(img(member['img'], member['name']))
      else:
        lines.append(f'<h3>{member["name"]}</h3>')
        if 'url' in member:
          lines[-1] = f'<a href=\"{member["url"]}\">{lines[-1]}</a>'
    lines.append('</div>\n</div>')
    return lines

  def parsenews(self, contents):
    contents = re.sub('^//.*$', '', '\n'.join(contents), flags=re.MULTILINE)
    lines = ['<ul style="list-style-type:circle;margin-bottom:80px;">']
    level = 0
    for item in json.loads(contents):
      lines.append('  <li style="margin-top:20px;">' + item['title'])
      if 'bullets' in item:
        lines.append('    <ul style="list-style-type:none; margin-bottom:20px;">')
        for bullet in item['bullets']:
          lines.append(f'      <li>{bullet}</li>')
        lines.append('    </ul>')
      if 'text' in item:
        lines.append('    <ul style="list-style-type:none; margin-bottom:20px;">')
        lines.append(item['text'])
        lines.append('    </ul>')
      lines.append('  </li>')
    lines.append('</ul>')
    return lines

  def parsepubs(self, contents):
    lines = ['<dl style="margin-bottom:80px;">']
    for bib, fields in PubParser(contents):
      if any([key not in fields for key in ('key','title','author')]):
        continue
      if not self.styles:
        self.styles = [
                      '.minimized-text {',
                      '      cursor: pointer;',
                      '      color: #007BFF;',
                      '      text-decoration: underline;',
                      '     }',
                      '     pre {',
                      '       border: 1px solid #CED4DA;',
                      '       border-radius: 4px;',
                      '       padding: 10px;',
                      '       overflow: auto;',
                      '       white-space: pre-wrap;',
                      '       display: none;',
                      '     }',
        ]
      lines.append(f'<dt>{fields["title"]}</dt>')
      lines.append(f'<dd>{fields["author"]}</dd>')
      if 'journal' in fields:
        lines.append(f'<dd>{fields["journal"]}</dd>')
      elif 'booktitle' in fields:
        lines.append(f'<dd>{fields["booktitle"]}</dd>')
      if 'note' in fields and 'Best Paper Award' in fields['note']:
        lines.append('<dd><em><u>|Best Paper Award|</u></em></dd>')
      if 'url' in fields:
        url = PubParser.domain.search(fields['url']).groups()
        if len(url) == 1:
          lines.append(f'<dd><a href =\"{fields["url"]}\">{url[0]}</a>')
      if 'note' in fields:
        for note in fields['note']:
          if ' \\url{' in note and note.endswith('}'):
            note = note.split()
            urlkind = note[0]
            urlkind = urlkind[0].upper() + urlkind[1:]
            note = urlkind + '=' + note[1].split('{')[1][:-1]
            url = ''
            for _, url in PubParser.nextfield(note):
              pass
            if not url:
              continue
            domain = PubParser.domain.search(url)
            if not domain:
              continue
            domain = domain.groups()
            if len(domain) == 1:
              lines.append(f'<dd>' + \
                          f'<a href =\"{url}\">{urlkind}: {domain[0]}' + \
                          '</a>')
      key = fields['key']
      lines.append('<dd><span class=\"minimized-text\"' + \
                  f' onclick=\"toggletext(\'bib{key}\', this)\">' + \
                  'Expand bibtex</span></dd>')
      lines.append(f'<pre id=\"bib{key}\">')
      for line in bib.split('\n'):
        lines.append(line)
      lines.append('</pre>')
    lines.append('</dl>')
    if self.styles:
      lines += [
                '<script>',
                'function toggletext(textid, clicker) {',
                '  const fulltext = document.getElementById(textid);',
                '  if (fulltext.style.display === "none" ||',
                '      fulltext.style.display === "") {',
                '    fulltext.style.display = "block";',
                '    clicker.innerHTML = "Hide bibtex";',
                '  }',
                '  else {',
                '    fulltext.style.display = "none";',
                '    clicker.innerHTML = "Expand bibtex";',
                '  }',
                '}',
                '</script>',
                ]
    return lines

if __name__ == '__main__':
  # The blank template
  template = HTMLTemplate()
  # The content input files
  contentfiles = [name for name in os.listdir('contents') if '.' not in name]
  if 'index' not in contentfiles:
    contentfiles.append('index')
  for basename in contentfiles:
    if os.path.isfile(os.path.join('contents', basename)):
      with open(os.path.join('contents', basename), 'r') as infile:
        contents = [line.rstrip() for line in infile.readlines()]
    else:
      contents = []
    html = template.processcontent(basename, contents)
    with open(os.path.join(f'{basename}.html'),'w') as outfile:
      outfile.write(html)

