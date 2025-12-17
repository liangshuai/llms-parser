参考以下llmstxt文档， 使用typescript写一个llms parser， 能够接受一个URL或者本地文件地址， 按照文档中的说明解析里面的llmstxt文档， 并返回一个结构化的对象， 这个对象包含llms中的所有文档片段， 如果某个片段是 optional content sections and a file list section delimited by H2 headers， 需要递归获取子文档的内容并解析



```
### FastHTML Project llms.txt Example

Source: https://llmstxt.org/index

This is a cut-down example of an llms.txt file for the FastHTML project. It showcases the use of H1 for the project name, a blockquote for a summary, and H2 sections for documentation and examples, each containing markdown lists with links and descriptions.

```markdown
# FastHTML

> FastHTML is a python library which brings together Starlette, Uvicorn, HTMX, and fastcore's `FT` "FastTags" into a library for creating server-rendered hypermedia applications.

Important notes:

- Although parts of its API are inspired by FastAPI, it is *not* compatible with FastAPI syntax and is not targeted at creating API services
- FastHTML is compatible with JS-native web components and any vanilla JS library, but not with React, Vue, or Svelte.

## Docs

- [FastHTML quick start](https://fastht.ml/docs/tutorials/quickstart_for_web_devs.html.md): A brief overview of many FastHTML features
- [HTMX reference](https://github.com/bigskysoftware/htmx/blob/master/www/content/reference.md): Brief description of all HTMX attributes, CSS classes, headers, events, extensions, js lib methods, and config options

## Examples

- [Todo list application](https://github.com/AnswerDotAI/fasthtml/blob/main/examples/adv_app.py): Detailed walk-thru of a complete CRUD app in FastHTML showing idiomatic use of FastHTML and HTMX patterns.

```

--------------------------------

### Install llms-txt using pip

Source: https://llmstxt.org/intro.html

This command installs the llms-txt package using pip, making the CLI and Python module available for use. Ensure you have pip installed and configured.

```sh
pip install llms-txt
```

--------------------------------

### Markdown Structure for llms.txt Example

Source: https://llmstxt.org/index

This example demonstrates the basic Markdown structure required for an llms.txt file. It includes the mandatory H1 title and blockquote summary, followed by optional content sections and a file list section delimited by H2 headers.

```markdown
# Title

> Optional description goes here

Optional details go here

## Section name

- [Link title](https://link_url): Optional link details

## Optional

- [Link title](https://link_url)
```

--------------------------------

### Get CLI help for llms_txt2ctx

Source: https://llmstxt.org/intro.html

This command displays the help message for the `llms_txt2ctx` CLI tool, outlining its available options and usage. This is useful for understanding the CLI's capabilities.

```sh
llms_txt2ctx -h
```

--------------------------------

### Enhanced 'ed' Startup and LLM Context Loading

Source: https://llmstxt.org/ed-commonmark

Initiates the 'ed' text editor and loads LLM documentation from a specified URL. This process involves checking for the 'llms.txt' file, parsing it, fetching URLs, and creating an LLM-readable context. It assumes an enhanced 'ed' version with commands like 'H' for help and 'L' for loading.

```shell
$ ed
* H
* L fastht.ml/docs
Checking for /llms.txt at fastht.ml/docs...
Found /llms.txt. Parsing...
Fetching URLs from "Docs" section...  Fetching URLs from "Examples" section...
Skipping "Optional" section for brevity.
Creating XML-based context for Claude...  Context created and loaded.
```

--------------------------------

### FastHTML 'Hello, World!' App Code

Source: https://llmstxt.org/ed-commonmark

Presents the generated Python code for a simple FastHTML application that renders 'Hello, World!' within a `<div>` element. This code is intended to be used with the `fast_app` framework and served.

```python
from fasthtml.common import *
app,rt = fast_app()
@rt
def index(): return div("Hello, World!")
serve()
```

--------------------------------

### Print beginning of LLM context file

Source: https://llmstxt.org/intro.html

This code prints the first 300 characters of the generated LLM context string (`ctx`). This is useful for quickly inspecting the beginning of the XML output.

```python
print(ctx[:300])

```

--------------------------------

### Viewing and Saving Generated FastHTML Code in 'ed'

Source: https://llmstxt.org/ed-commonmark

Shows how to inspect the generated code within the 'ed' editor using the 'n' command for line count and 'p' command for printing the buffer content. It then demonstrates saving the generated FastHTML application to a Python file using the 'w' command and quitting 'ed' with 'q'.

```shell
* n
5
* p
from fasthtml.common import *
app,rt = fast_app()
@rt
def index(): return div("Hello, World!")
serve()
*w hello_world.py
5
*q
```

--------------------------------

### Access parsed title and summary

Source: https://llmstxt.org/intro.html

This code accesses and prints the `title` and `summary` attributes from the parsed `llms.txt` data structure. These attributes typically hold the main project title and a brief description.

```python
parsed.title,parsed.summary

```

--------------------------------

### Create LLM context file from llms.txt content

Source: https://llmstxt.org/intro.html

The `create_ctx` function generates an LLM context file in XML format from the provided 'llms.txt' content. This output is suitable for systems like Claude and is what the CLI tool uses internally.

```python
ctx = create_ctx(samp)

```

--------------------------------

### Generating FastHTML App with 'ed' AI Command

Source: https://llmstxt.org/ed-commonmark

Utilizes a hypothetical 'x' (eXecute AI) command in an LLM-enhanced 'ed' editor to generate a FastHTML web application. The command takes a natural language prompt, analyzes the loaded LLM context, and produces code that is written directly into the editor's buffer.

```shell
* x Create a simple FastHTML app which outputs 'Hello, World!', in a <div>.
Analyzing context and prompt...
Generating FastHTML app...
App written to buffer.
```

--------------------------------

### Convert llms.txt to XML context using CLI

Source: https://llmstxt.org/intro.html

This CLI command converts an 'llms.txt' file into an XML context file, saving the output to 'llms.md'. The `--optional True` flag can be used to include the 'Optional' section from the input file.

```sh
llms_txt2ctx llms.txt > llms.md

```

```sh
llms_txt2ctx --optional True llms.txt > llms.md

```

--------------------------------

### Access specific optional section content

Source: https://llmstxt.org/intro.html

This code demonstrates accessing a specific item within the 'Optional' section of the parsed `llms.txt` data. It retrieves the first item, likely a dictionary containing details about a link or resource.

```python
parsed.sections.Optional[0]

```

--------------------------------

### Import llms_txt module in Python

Source: https://llmstxt.org/intro.html

This Python statement imports all functions and classes from the `llms_txt` library, making them available for use in your script. This is the first step when using the library programmatically.

```python
from llms_txt import *

```

--------------------------------

### Read llms.txt content into a string

Source: https://llmstxt.org/intro.html

This Python code snippet reads the content of an 'llms-sample.txt' file into a string variable named `samp`. It utilizes the `Path` object from the `pathlib` module for file operations.

```python
samp = Path('llms-sample.txt').read_text()

```

--------------------------------

### Minimalist Python parser for llms.txt

Source: https://llmstxt.org/intro.html

This Python code provides a self-contained parser for 'llms.txt' files with no external dependencies beyond standard libraries. It uses regular expressions to extract the title, summary, info, and sections from the input text.

```python
from pathlib import Path
import re,itertools

def chunked(it, chunk_sz):
    it = iter(it)
    return iter(lambda: list(itertools.islice(it, chunk_sz)), [])

def parse_llms_txt(txt):
    """Parse llms.txt file contents in `txt` to a `dict`"""
    def _p(links):
        link_pat = '-\\s*\[(?P<title>[^\\]+)\]\((?P<url>[^\\)]+)\)(?::\\s*(?P<desc>.*))?'
        return [re.search(link_pat, l).groupdict()
                for l in re.split(r'\\n+', links.strip()) if l.strip()]

    start,*rest = re.split(fr'^##\\s*(.*?$)', txt, flags=re.MULTILINE)
    sects = {k: _p(v) for k,v in dict(chunked(rest, 2)).items()}
    pat = '^#\\s*(?P<title>.+?)\\n+(?:^>\\s*(?P<summary>.+?)$)?\\n+(?P<info>.*)'
    d = re.search(pat, start.strip(), (re.MULTILINE|re.DOTALL)).groupdict()
    d['sections'] = sects
    return d

```

--------------------------------

### Parse llms.txt content into a data structure

Source: https://llmstxt.org/intro.html

The `parse_llms_file` function takes the content of an 'llms.txt' file as a string and returns a data structure representing its sections. The `optional=True` argument can be passed to include the optional section.

```python
parsed = parse_llms_file(samp)
list(parsed)

```

--------------------------------

### List sections from parsed llms.txt

Source: https://llmstxt.org/intro.html

This Python code snippet lists the top-level section titles found within the parsed `llms.txt` data. These usually correspond to the main headings in the input file.

```python
list(parsed.sections)

```

=== COMPLETE CONTENT === This response contains all available snippets from this library. No additional content exists. Do not make further requests.
```
