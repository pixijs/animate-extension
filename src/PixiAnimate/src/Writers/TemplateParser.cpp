#include "Writers/TemplateParser.h"

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <map>

namespace PixiJS
{
    TemplateParser::TemplateParser(const std::map<std::string, std::string> &map)
    {
        this->substitutions = map;
    }

    std::string TemplateParser::getContent(void) const
    {
        return this->content;
    }

    void TemplateParser::replaceAll(const std::string &from, const std::string &to)
    {
        size_t start_pos = 0;
        while((start_pos = this->content.find(from, start_pos)) != std::string::npos)
        {
            this->content.replace(start_pos, from.length(), to);
            start_pos += to.length();
        }
    }

    bool TemplateParser::open(const std::string &file)
    {
        std::ifstream inFile(file.c_str());
        if (!inFile)
        {
            return false;
        }
        std::stringstream strStream;
        strStream << inFile.rdbuf();
        this->content = strStream.str();

        map<string, string>::iterator i;

        for ( i = this->substitutions.begin(); i != this->substitutions.end(); i++)
        {
            this->replaceAll("${" + i->first + "}", i->second);
        }
        return true;
    }

    void TemplateParser::save(const string &file)
    {
        std::ofstream output(file.c_str());
        if (output.is_open())
        {
            output << this->content;
            output.close();
        }
    }
}