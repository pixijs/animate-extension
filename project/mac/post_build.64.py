	
import os, sys, glob, platform, string, re, copy, shutil, filecmp, time
from optparse import OptionParser

#-----------------------------------------------------
# This script was generated by mpmakeproj_common.py
#-----------------------------------------------------

#-----------------------------------------------------
# A utility function to work around an exception case in os.makedirs that can occur when two projects attempt to post-copy to the
# same destination at the same time.
#-----------------------------------------------------
def makedirs(path):
	path = os.path.normpath(path)
	for c in range(0, len(path.split(os.path.sep))):
		try:
			return os.path.exists(path) or os.makedirs(path)
		except OSError:
			pass

#-----------------------------------------------------
def do_copy_file(source_filepath, dest_filepath):
	dest_dir = os.path.split(dest_filepath)[0]
	if not os.path.exists(dest_dir):
		print('The destination directory', dest_dir, ' does not yet exist!')
		os.error(-1)

	if os.path.exists(dest_filepath) is True:
		if filecmp.cmp(source_filepath, dest_filepath) is True:
			return
		os.chmod(dest_filepath, 0o777)
		os.remove(dest_filepath)
	shutil.copy2(source_filepath, os.path.split(dest_filepath)[0])

#-----------------------------------------------------
def copy_all_in_directory(directory_from, directory_to):
	for file in os.listdir(directory_from):
		path_from = os.path.join(directory_from, file)
		path_to = os.path.join(directory_to, file)
		
		# note - check for symbolic links for frameworks and copy them as well
		try:
			if os.path.islink(path_from):
				link_to = os.readlink(path_from)
				if os.path.exists(path_to):
					os.remove(path_to)
				os.symlink(link_to, path_to)
			elif not os.path.isdir(path_from):
				do_copy_file(path_from, path_to)
			else:
				makedirs(path_to)
				copy_all_in_directory(path_from, path_to)
		except (IOError, os.error) as why:
			print("buildcopy failure - Can't copy %s to %s: %s" % (repr(path_from), repr(path_to), str(why)))

#-----------------------------------------------------
def do_copy(source_filepath, dest_directory):
	source_list = glob.glob(source_filepath)	
	
	if source_list == [ ]:
		# [TODO] Change these to 'error:' to trigger Xcode build failurees.  Need more time to fix the failures - so warnings only now.
		print('  warning: Files were specified to copy, but the files did not exist.')
		print('  warning:   In script:')
		print('  warning:      ' + os.path.normpath(os.path.abspath(__file__)))
		print('  warning:    Files that were not found:')
		print('  warning:      ' + source_filepath)
		print('')
		os.error(-1)
	
	for source_item in source_list:

		# we globbed at the start so we could accept wildcard syntax (to get *.nib, *.framework, etc)
		# which in turn will product folders with contents, etc.
		if os.path.isdir(source_item):
			# get the leaf folder name so we can create it
			dest_dir_name = os.path.split(source_item)[1]
			dest_directory_plus_leaf_dir = os.path.join(dest_directory, dest_dir_name)
			makedirs(dest_directory_plus_leaf_dir)
			copy_all_in_directory(source_item, dest_directory_plus_leaf_dir)
		else:
			if not os.path.exists(source_item):
					print('Error copying file or directory', source_item)
					os.error(-1)
			makedirs(dest_directory)
			source_filename = os.path.split(source_item)[1]
			dest_filepath = os.path.join(dest_directory, source_filename)
			do_copy_file(source_item, dest_filepath)

#-----------------------------------------------------
def option_parser():
	parser = OptionParser()
	parser.add_option('-c' , '--config', type='string', dest='config', help='the configuration = $(ConfigurationName)')
	parser.add_option('-a', '--alwaysrun', action='store_true', dest='alwaysrun', help='specifying this option will only execute the parts of the script that should be run for every build (regardless of the build state of the rest of hte project).  Overrides normal dependency behavior.')	
	return parser

#-----------------------------------------------------
def fix_broken_symlinks(path, should_fix):
	has_broken = False
	is_windows = os.name is 'nt'
	
	if not is_windows:
		dir_entries = os.listdir(path)
		for each_entry in dir_entries:
			each_full_path = os.path.join(path, each_entry)
			nested_was_broken = False
			if (os.path.islink(each_full_path)):
				if (not os.path.exists(each_full_path)):
					has_broken = True
					if should_fix:
						print('WARNING!!! Deleting broken symlink:')
						print(os.remove(each_full_path))
					else:
						print('Broken symlink: ')
					print('  ' + str(each_full_path))
			elif os.path.isdir(each_full_path):
				nested_was_broken = fix_broken_symlinks(each_full_path, should_fix)
			if (not has_broken) and nested_was_broken:
				has_broken = True
		
	return has_broken
	

#-----------------------------------------------------
def has_broken_symlinks(path):
	return fix_broken_symlinks(path, False)
	

#-----------------------------------------------------
def run_any_product_specific_scripts(options):
	thisDir = os.path.dirname(__file__)
	project_specific_dir = os.path.join(thisDir, 'project_specific_scripts')
	
	is_windows = os.name is 'nt'
	this_script_depth_is_32 = True
	if is_windows:
		filepath = __file__
		this_script_depth_is_32 = filepath.endswith(".32.py")
		
	if (os.path.exists(project_specific_dir)):
		sys.path.append(project_specific_dir)
		file_list = os.listdir(project_specific_dir)
	
		for each_file in file_list:
			(root, ext) = os.path.splitext(each_file)
			full_path = os.path.join(project_specific_dir, each_file)
			is_file = os.path.isfile(full_path)
			if is_windows:
				if this_script_depth_is_32:
					is_file = full_path.endswith("_32.py")
				else:
					is_file = full_path.endswith("_64.py")
			if is_file and (ext == '.py'):
				each_import = __import__(root)
				import inspect
				for each_item in dir(each_import):
					obj = getattr(each_import, each_item)
					if inspect.isfunction(obj) and str(each_item) == 'get_source_and_dest_copy_paths':
						arg_spec = inspect.getargspec(obj)
						# Verify that this function contains a 'config' argument.
						if (arg_spec[0] and arg_spec[0][0] and arg_spec[0][0] == 'config'):
							print('Runing project specific copy script: ')
							print('  ' + os.path.normpath(full_path))
							path_list = each_import.get_source_and_dest_copy_paths(options.config.upper())
							for each_path in path_list:
								copy_src = each_path[0]
								print(' Copying:')
								print('  ' + copy_src)
								print(' To:')
								print('  ' + each_path[1])
								do_copy(copy_src, each_path[1])
								(copy_src_root, ext) = os.path.splitext(copy_src)
								copy_src_pdb = copy_src_root + '.pdb'
								if (os.path.exists(copy_src_pdb)):
									print(' Copying:')
									print('  ' + copy_src_pdb)
									print(' To:')
									print('  ' + each_path[1])
									do_copy(copy_src_pdb, each_path[1])
								
						else:
							print('  WARNING! A project specific python file was found, but it does not contain the required function: ' + root + ext)
			print('')

#-----------------------------------------------------
def main(args):
	parser = option_parser()
	(options, args) = parser.parse_args(args)
	if len(args) != 0:
		parser.error('all options need to start with a dash')
		return -1
	if not options.config:
		parser.error('No config specified. Use -config $(ConfigurationName) in your commandline arg')
		return -1

	#	Account for target names that have project names as part of the target.
	#	Ex: "Foo.Debug' converts the config to "Debug"
	splitConfig = options.config.split('.',1)
	options.config = splitConfig[len(splitConfig) - 1]

	print('Running generated script: ' + time.strftime('%m/%d/%Y %I:%M:%S %p', time.localtime()))
	full_path = os.path.normpath(os.path.abspath(__file__))
	print('  ' + full_path)
	print('')

	try:
		run_any_product_specific_scripts(options)
	except:
		#	If this script is always run as a custom build step, we don't want
		#	to fail on copy failures (it may have been in the middle of a build).
		#	The post build step run later will do the copy again.
		if (not options.alwaysrun):
			raise

if __name__ == "__main__":
	main(sys.argv[1:])

