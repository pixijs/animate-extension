//
//  TemplateParser.hpp
//  PixiAnimate.mp
//
//  Created by Matt Karl 2/1/2016
//
//

#ifndef TEMPLATE_PARSER_H_
#define TEMPLATE_PARSER_H_

#include <string>
#include <map>

namespace PixiJS
{
    using namespace std;

    class TemplateParser
    {
    public:
        TemplateParser(const map<string, string> &map);
        bool open(const string &file);
        string getContent(void) const;
        void save(const string &file);
    private:
        map<string, string> substitutions;
        string content;
        void replaceAll(const string &from, const string &to);
    };
}

#endif // TEMPLATE_PARSER_H_