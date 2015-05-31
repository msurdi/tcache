pcache
======

pcache is a command line tool for caching paths (directory trees). An example usecase would be
a build/continuous integration system where on each build application dependencies need to be
setup consuming considerable time and quite often depending on the network or external repositories
being available and not banning users for abuse.

Example use case
----------------

In the following example, the command `pip install -r requirements.txt` will be executed only
if one of the following conditions is true:

  - It is the first time you run the command, thus the _env_ directory doesn't exist yet
  - The contents of requirements.txt has changed since the last time it was run
  - The cached version of _env_ is older than 1 day


        $ pcache -p env -k $(md5 -q requirements.txt) -r 1d -- pip install -r requirements.txt --root=env
       
        
By default cached directory trees are stored in $HOME/.pcache, this can be changed with the -c option.

Please, run `pcache --help` for further details and usage examples.